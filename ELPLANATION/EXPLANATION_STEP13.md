# Step 13: frontend のコンテナ化

## このStepで何をしたか

Step 13では、Next.js frontend を Docker コンテナ内で起動できるようにし、ローカル Node.js 環境へ依存しない実行方法を追加しました。

今回のStepでは、frontend 単体の build / 起動確認に集中し、Compose はまだ導入していません。
そのため backend との接続先は「ホストOS上で起動している FastAPI」を前提に整理しています。

## 追加・変更したファイル

| ファイル | 役割 |
| --- | --- |
| `frontend/Dockerfile` | Next.js 開発サーバーをコンテナ内で起動する手順を定義した |
| `frontend/.dockerignore` | build context から不要ファイルを除外した |
| `frontend/playwright.config.ts` | Playwright の接続先を環境変数で切り替えられるようにした |
| `frontend/e2e/frontend-container-smoke.spec.ts` | frontend コンテナで `/books` 画面へ到達できることを確認する Playwright テストを追加した |
| `README.md` | frontend 単体コンテナ時の `NEXT_PUBLIC_API_BASE_URL` の扱いを仕様へ反映した |
| `LEARNING_PROGRESS.md` | Step 13 の進捗と理解内容を記録した |
| `LEARNING_ROADMAP.md` | Step 13 の完了状態を更新した |

## なぜこの対応が必要か

Step 12で backend は Docker 化できましたが、frontend はまだローカル Node.js に依存していました。
この状態だと、backend だけDockerで、frontend だけホスト実行という不揃いな確認しかできません。

そこで Step 13では、Next.js を単体コンテナとして build / 起動できる状態を作り、次の Step 14 の Compose 化へ進める土台を整えました。

## コードレベル説明

### `frontend/Dockerfile`

```dockerfile
FROM node:22-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
```

このコードで何が起きているか:

- 入口: Docker build 時にこの Dockerfile が読まれる
- ベースイメージ: `node:22-bookworm-slim` を使い、Node.js 実行環境を最小限で用意する
- `WORKDIR /app`: 以降の `COPY` や `RUN` の基準ディレクトリを `/app` に固定する
- `ENV NEXT_TELEMETRY_DISABLED=1`: Next.js の telemetry 送信を無効化し、余計な対話や通知を減らす
- `COPY package.json package-lock.json ./`: lock file を含めて依存関係定義だけ先にコピーする
- `RUN npm ci`: `package-lock.json` に固定された依存関係をそのまま install する
- `COPY . .`: アプリ本体をコンテナへコピーする
- `EXPOSE 3000`: frontend が使うポートを明示する
- `CMD ...`: コンテナ起動時に `next dev --hostname 0.0.0.0 --port 3000` を実行する

この構成で保証できること:

- lock file ベースで依存関係を再現しやすい
- `docker run -p 3000:3000` でホストブラウザから到達できる

この構成でまだ保証できないこと:

- 本番用に最適化されたイメージサイズ
- Compose を使った backend / db との同時起動

### `frontend/.dockerignore`

```text
node_modules
.next
playwright-report
test-results
.env.local
```

このコードで何が起きているか:

- Docker build の入口で、送る必要がないファイルを build context から外している
- `node_modules` を除外することで、ホストOSで install 済みの依存関係をそのまま持ち込まず、コンテナ内 `npm ci` を正にできる
- `.next` を除外することで、ホスト側の build 結果が混ざるのを防ぐ
- `.env.local` を除外することで、個人のローカル設定をイメージへ誤って含めない

### `frontend/lib/api.ts`

```ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
```

このコードで何が起きているか:

- 入口: `fetchBooks()` `createBook()` `updateBook()` `deleteBook()` などの API 通信関数が呼ばれる前に評価される
- 引数: なし
- 戻り値: API の基準URLを表す文字列
- 内部処理: 環境変数 `NEXT_PUBLIC_API_BASE_URL` があればそれを使い、なければ `http://localhost:8000` を使う

ここで重要な点:

- `BooksPage` のようなサーバーコンポーネントから `fetchBooks()` を呼ぶと、通信はブラウザではなく Next.js サーバー側で実行される
- そのため frontend を Docker コンテナで動かす場合、`localhost:8000` はホストOS上の backend ではなく、frontend コンテナ自身を指してしまう
- Step 13ではこの差を README に明記し、frontend 単体コンテナ時は `http://host.docker.internal:8000` を使う方針にした

### `frontend/e2e/frontend-container-smoke.spec.ts`

```ts
test("frontend container で books 画面へ到達できる", async ({ page }) => {
  await mkdir(evidenceDir, { recursive: true });

  await page.goto("/books");

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();

  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "01-frontend-container-books.png"),
  });
});
```

このコードで何が起きているか:

- 入口: `npx playwright test frontend-container-smoke.spec.ts` で実行される
- 引数: Playwright から `page` が渡される
- 戻り値: なし。期待条件を満たさない場合はテスト失敗になる
- 内部処理の順番:
  1. 証跡保存ディレクトリを作成する
  2. `/books` へアクセスする
  3. URL が `/books` で終わることを確認する
  4. 見出し `Book list` が表示されることを確認する
  5. スクリーンショットを `test/evidence/step13-playwright` へ保存する

このテストが保証できること:

- frontend コンテナ経由でブラウザから `/books` 画面へ到達できる
- 画面の最低限の SSR 結果を確認できる

このテストが保証できないこと:

- CRUD 一連の操作
- Compose 化後の複数コンテナ連携

### `frontend/playwright.config.ts`

```ts
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3011";
```

このコードで何が起きているか:

- 入口: `npx playwright test` 実行時に Playwright 設定として読まれる
- 引数: なし
- 戻り値: テスト実行時に使う `baseURL` 文字列
- 内部処理: 環境変数 `PLAYWRIGHT_BASE_URL` があればそれを使い、なければ従来どおり `http://127.0.0.1:3011` を使う

この変更が必要だった理由:

- 既存のCRUD E2Eはローカル起動の `3011` 番 frontend を前提にしていた
- Step 13 では Docker コンテナの `3000` 番を対象にしたいため、設定を使い回しつつ接続先だけ切り替えられる形にした

## 初学者向けの読み順

1. `frontend/Dockerfile` を読み、どの手順でコンテナが組み立てられるか確認する
2. `frontend/.dockerignore` を読み、なぜホスト側ファイルを除外するのか確認する
3. `frontend/lib/api.ts` を読み、API URL がどこから決まるか確認する
4. `frontend/app/books/page.tsx` を読み、`fetchBooks()` がサーバー側で呼ばれることを確認する
5. `frontend/playwright.config.ts` を読み、テストの接続先がどこで決まるか確認する
6. `frontend/e2e/frontend-container-smoke.spec.ts` を読み、ブラウザ確認の自動化方法を追う

## 動作確認で使ったコマンド

目的: backend をホストOS側で起動し、frontend コンテナから参照できるようにする。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\backend`

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

目的: frontend イメージを build する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
docker build -t library-frontend-step13 .
```

目的: frontend コンテナを起動し、ホストOS上の backend を参照できるようにする。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
docker run --rm -d -p 3000:3000 --name library-frontend-step13 -e NEXT_PUBLIC_API_BASE_URL=http://host.docker.internal:8000 library-frontend-step13
```

目的: frontend コンテナで表示される `/books` 画面を Playwright で確認する。  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/frontend-container-smoke.spec.ts
```

目的: 動作確認後に Step 13 用コンテナを停止する。  
実行ディレクトリ: 任意

```powershell
docker stop library-frontend-step13
```

## Playwright テスト内容

- 対象: `frontend/e2e/frontend-container-smoke.spec.ts`
- 確認内容:
  - `http://127.0.0.1:3000/books` へ到達できること
  - 見出し `Book list` が表示されること
  - 証跡画像を保存できること
- 実行コマンド:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/frontend-container-smoke.spec.ts
```

- 保存したエビデンス:
  - `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step13-playwright\01-frontend-container-books.png`

## 画面確認手順

Step 13では画面遷移よりも「コンテナ起動した frontend へブラウザで到達できること」を確認対象にしています。

1. backend を `8000` 番で起動する
2. frontend コンテナを `3000` 番で起動する
3. ブラウザで `http://127.0.0.1:3000/books` を開く
4. 期待結果として、`Book list` 見出しと本一覧画面が表示されることを確認する
