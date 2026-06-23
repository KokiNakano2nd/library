# Step 14: Docker Compose で 3 サービスをまとめる

## このStepで何をしたか

Step 14では、frontend / backend / db を `docker compose` でまとめて起動できるようにし、アプリ全体を1つの構成で再現できる状態を作りました。

今回のStepでは、Compose の基本構成、コンテナ間通信、DB永続化、最低限の疎通確認までを対象にしています。
環境変数の責務分離や migration 運用ルールの整理は、次の Step 15 で詰めます。

## 追加・変更したファイル

| ファイル | 役割 |
| --- | --- |
| `docker-compose.yml` | frontend / backend / db をまとめて起動する Compose 定義 |
| `frontend/lib/api.ts` | ブラウザ向けURLと内部通信用URLを切り替える API 呼び出しロジック |
| `frontend/e2e/docker-compose-smoke.spec.ts` | Compose 起動後に `/books` 画面へ到達できるか確認する Playwright テスト |
| `README.md` | Compose 利用時の `DATABASE_URL` と API URL の仕様を反映 |
| `LEARNING_PROGRESS.md` | Step 14 の進捗、理解内容、次アクションを記録 |
| `LEARNING_ROADMAP.md` | Step 14 の完了状態を更新 |

## なぜこの対応が必要か

Step 12とStep 13で backend と frontend をそれぞれ単体コンテナ化できましたが、まだ3層を一度に立ち上げる方法がありませんでした。
この状態では、毎回どの順で起動するか、どの接続先を入れるかを手作業で合わせる必要があり、再現性が低くなります。

そこで Step 14では、3サービスを1つの Compose 定義へまとめ、次の Step 15 と Step 16で運用整理と疎通確認を進めやすい土台を作りました。

## コードレベル説明

### `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: library
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d library"]

  backend:
    build:
      context: ./backend
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql+psycopg://postgres:password@db:5432/library
    command:
      [
        "sh",
        "-c",
        "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000",
      ]

  frontend:
    build:
      context: ./frontend
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:8000
      INTERNAL_API_BASE_URL: http://backend:8000
```

このコードで何が起きているか:

- 入口: `docker compose up -d --build` を実行すると Compose がこの定義を読む
- `db` サービス:
  - 引数: `POSTGRES_DB` `POSTGRES_USER` `POSTGRES_PASSWORD`
  - 役割: PostgreSQL 17 のコンテナを起動し、`postgres_data` volume にデータを保存する
  - 保証できること: コンテナを消しても named volume が残る限りDBデータが維持される
  - 保証できないこと: volume を削除した場合のデータ保持までは保証しない
- `healthcheck`:
  - 内部処理: `pg_isready` で PostgreSQL が接続受付可能かを確認する
  - 役割: backend が早すぎるタイミングでDBへ接続しに行くリスクを減らす
- `backend` サービス:
  - 引数: `DATABASE_URL`
  - 戻り値: HTTP `8000` 番ポートで FastAPI を待ち受ける実行状態
  - 内部処理の順番:
    1. `db` の healthcheck 成功を待つ
    2. `alembic upgrade head` で books テーブルを作る
    3. `uvicorn` で API サーバーを起動する
  - 呼び出し先: Alembic、FastAPI、PostgreSQL
  - 異常系: migration 失敗時は backend コンテナが正常起動しない
- `frontend` サービス:
  - 引数: `NEXT_PUBLIC_API_BASE_URL` `INTERNAL_API_BASE_URL`
  - 役割: ブラウザ用の公開API URLと、frontend コンテナ内部で使う backend 接続先を分離する

### `frontend/lib/api.ts`

```ts
const BROWSER_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const SERVER_API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL ?? BROWSER_API_BASE_URL;

function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return SERVER_API_BASE_URL;
  }

  return BROWSER_API_BASE_URL;
}
```

このコードで何が起きているか:

- 入口: `fetchBooks()` `createBook()` `updateBook()` などの API 関数から呼ばれる
- 引数: なし
- 戻り値: 実行環境に応じた API 基準URL文字列
- state: なし
- 例外: この関数自体は例外を投げない
- 内部処理の順番:
  1. `window` が存在するかどうかで、ブラウザ実行かサーバー実行かを判定する
  2. サーバー実行なら `INTERNAL_API_BASE_URL` を返す
  3. ブラウザ実行なら `NEXT_PUBLIC_API_BASE_URL` を返す
- 呼び出し先: なし
- 正常系:
  - browser では `http://localhost:8000`
  - frontend コンテナの server-side fetch では `http://backend:8000`
- 異常系:
  - 環境変数未設定時は最終的に `http://localhost:8000` を使うため、Compose 用の内部通信としては誤接続になる可能性がある

この変更が必要だった理由:

- `BooksPage` のようなサーバーコンポーネントでは API 呼び出しが frontend コンテナ内で実行される
- 一方で `BookForm` の送信処理はブラウザ側で実行される
- そのため1つの URL だけでは両方を正しく満たせない

### `frontend/e2e/docker-compose-smoke.spec.ts`

```ts
test("docker compose で books 画面へ到達できる", async ({ page }) => {
  await mkdir(evidenceDir, { recursive: true });

  await page.goto("/books");

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();
});
```

このコードで何が起きているか:

- 入口: `npx playwright test e2e/docker-compose-smoke.spec.ts`
- 引数: Playwright の `page`
- 戻り値: なし
- state: `evidenceDir` に証跡保存先を持つ
- 例外: 画面遷移や見出し確認に失敗するとテスト失敗になる
- 内部処理の順番:
  1. 証跡保存ディレクトリを作る
  2. `/books` へ遷移する
  3. URL が `/books` で終わることを確認する
  4. `Book list` 見出しが見えることを確認する
  5. スクリーンショットを保存する
- 呼び出し先: Playwright の `page.goto` `expect` `page.screenshot`
- 正常系: Compose で起動した frontend に到達できる
- 異常系: backend 接続失敗や frontend 起動失敗時は見出し確認で落ちる

## 初学者向けの読み順

1. `docker-compose.yml` を読み、どのサービスが起動するか確認する
2. `backend/app/database.py` を読み、`DATABASE_URL` がどこで使われるか確認する
3. `frontend/lib/api.ts` を読み、公開URLと内部URLをどう切り替えるか確認する
4. `frontend/app/books/page.tsx` と `frontend/components/BookForm.tsx` を読み、server-side fetch と client-side fetch の違いを確認する
5. `frontend/e2e/docker-compose-smoke.spec.ts` を読み、何をもって Compose 成功と判断したか確認する

## 動作確認で使ったコマンド

目的: Compose 定義の解釈結果を確認する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose config
```

目的: Step 14 用の3サービスを build して起動する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose up -d --build
```

目的: 起動したサービスの状態を確認する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose ps
```

目的: backend コンテナで migration 実行と FastAPI 起動が成功したかを確認する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose logs backend --tail 40
```

目的: backend の `/health` へ疎通できることを確認する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health | Select-Object -ExpandProperty Content
```

目的: frontend の ESLint エラーがないことを確認する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
npm run lint
```

目的: Compose で起動した frontend の `/books` 画面を Playwright で確認する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/docker-compose-smoke.spec.ts
```

## Playwright テスト内容

- 対象: `frontend/e2e/docker-compose-smoke.spec.ts`
- 確認内容:
  - `http://127.0.0.1:3000/books` へ遷移できる
  - URL が `/books` で終わる
  - `Book list` 見出しが表示される
- 実行コマンド:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/docker-compose-smoke.spec.ts
```

- 保存したエビデンス:
  - `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step14-playwright\01-docker-compose-books.png`

## 画面確認手順

1. `docker compose up -d --build` を実行する
2. ブラウザで `http://127.0.0.1:3000/books` を開く
3. 期待される遷移先URLが `http://127.0.0.1:3000/books` であることを確認する
4. 期待結果として、`Book list` 見出しと本一覧画面が表示されることを確認する
