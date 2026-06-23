# Step 15: 環境変数と migration 運用の整理

## このStepでやったこと
Step 15では、Docker Compose で使う環境変数名と、backend / frontend が普段読む環境変数名をそろえました。あわせて、backend コンテナ内で Alembic migration を明示実行する運用を確認し、Playwright で `/books` 画面が引き続き表示できることを証跡付きで確認しました。

Step 14の時点で Compose 自体は動いていましたが、接続文字列と API URL が `docker-compose.yml` に固定されている状態でした。このままだと「どの値を `.env.example` に書けばよいか」「Compose で上書きしたいときに何を変えればよいか」が分かりにくくなります。そこで Step 15では、環境変数の名前を統一し、学習用テンプレートにも Docker 用の値を追記しました。

## 追加・変更したファイル

| ファイル | 役割 |
| --- | --- |
| `docker-compose.yml` | Compose 側も `DATABASE_URL` / `NEXT_PUBLIC_API_BASE_URL` / `INTERNAL_API_BASE_URL` をそのまま受け取るように変更 |
| `backend/.env.example` | ローカル実行時と Compose 実行時の `DATABASE_URL` を学習用テンプレートとして併記 |
| `frontend/.env.local.example` | ブラウザ向け公開 URL と Compose の内部 URL をテンプレートとして明示 |
| `frontend/e2e/docker-compose-env-migration.spec.ts` | Step 15 用の Playwright 証跡を保存する smoke test |
| `README.md` | 環境変数名を Compose とアプリで統一する方針を仕様へ反映 |
| `LEARNING_ROADMAP.md` | Step 15 を完了に更新 |
| `LEARNING_PROGRESS.md` | Step 15 の進捗、確認内容、次のStepを更新 |

## 実装部分のコードレベル説明

### `docker-compose.yml`

```yaml
services:
  backend:
    environment:
      DATABASE_URL: ${DATABASE_URL:-postgresql+psycopg://postgres:password@db:5432/library}

  frontend:
    environment:
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8000}
      INTERNAL_API_BASE_URL: ${INTERNAL_API_BASE_URL:-http://backend:8000}
```

このコードで何が起きているか:

- 入口: `docker compose up` や `docker compose config`
- 引数: シェル環境変数、または Compose が読む `.env`
- 戻り値: Compose が解決した環境変数つきのコンテナ設定
- state: なし
- 例外: 変数が未設定でも `:-...` の既定値で起動できる
- 内部処理の順番:
  1. Compose が `${...:-...}` を評価する
  2. 既に同名の環境変数があればそれを使う
  3. なければ Step 14 と同じ既定値を使う
  4. backend / frontend コンテナへ同名の環境変数を注入する
- 呼び出し先: backend は `app.database.get_database_url()` と Alembic、frontend は `frontend/lib/api.ts`
- 正常系: 既定値または上書き値で 3 サービスが起動する
- 異常系: URL 自体が誤っていれば backend 起動失敗、または frontend の API 通信失敗になる

この変更で保証できること:

- Compose とアプリ本体で使う環境変数名がずれない
- 既定値のままでも Step 14 と同じ構成で起動できる

保証できないこと:

- 変数に入れた接続先が正しいことまでは保証しない
- Linux 環境で `host.docker.internal` が常に使えることは保証しない

### `backend/.env.example`

```env
# FastAPI / Alembic をローカル実行するとき
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/library

# Docker Compose の backend サービスで使うとき
# DATABASE_URL=postgresql+psycopg://postgres:password@db:5432/library
```

このコードで何が起きているか:

- 入口: 学習者が `.env` を作るとき
- 引数: なし
- 戻り値: なし
- state: なし
- 例外: なし
- 内部処理の順番:
  1. ローカル FastAPI / Alembic 実行用の値を見る
  2. Compose の backend サービスで必要なホスト名 `db` もコメントで確認できる
- 呼び出し先: 実際の読み取り先は `backend/app/database.py`
- 正常系: `.env.example` を見ればローカル用と Compose 用の違いが分かる
- 異常系: コメントを外さずに使うなど、最終設定ミスまでは防げない

### `frontend/.env.local.example`

```env
# ブラウザが参照する公開 API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Docker Compose で Next.js の server-side fetch が使う内部 URL
# INTERNAL_API_BASE_URL=http://backend:8000
```

このコードで何が起きているか:

- 入口: 学習者が `frontend/.env.local` を作るとき
- 引数: なし
- 戻り値: なし
- state: なし
- 例外: なし
- 内部処理の順番:
  1. ブラウザ向け URL と内部通信用 URL を別物として読む
  2. Compose のときだけ `INTERNAL_API_BASE_URL` が必要だと理解できる
- 呼び出し先: `frontend/lib/api.ts`
- 正常系: ブラウザ視点と server-side fetch 視点のURLを混同しにくくなる
- 異常系: browser URL に `backend` を直接入れると、ブラウザが名前解決できず失敗する

### `frontend/e2e/docker-compose-env-migration.spec.ts`

```ts
const evidenceDir = path.resolve("../test/evidence/step15-playwright");

test("docker compose の環境変数設定で books 画面を表示できる", async ({
  page,
}) => {
  await mkdir(evidenceDir, { recursive: true });
  await page.goto("/books");
  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();
});
```

このコードで何が起きているか:

- 入口: `npx playwright test e2e/docker-compose-env-migration.spec.ts`
- 引数: Playwright の `page`
- 戻り値: なし
- state: `evidenceDir`
- 例外: `/books` が表示できない、URL がずれる、見出しが出ない場合にテスト失敗
- 内部処理の順番:
  1. Step 15 用の証跡ディレクトリを作る
  2. Compose で起動中の `http://127.0.0.1:3000/books` へ移動する
  3. URL と `Book list` 見出しを検証する
  4. スクリーンショットを保存する
- 呼び出し先: Compose 起動中の frontend / backend / db
- 正常系: 画面が開き、証跡画像が保存される
- 異常系: 環境変数設定や migration が壊れていれば画面描画前に失敗する

## migration 運用の整理

Step 15では、migration の実行主体を「backend コンテナ内の Alembic」と整理しました。つまり、Compose で backend が使う `DATABASE_URL` と、`docker compose exec backend alembic upgrade head` が使う `DATABASE_URL` は同じ値であるべきです。

この整理でコードを読む順番は次の通りです。

1. `docker-compose.yml` で backend にどの `DATABASE_URL` が入るか見る
2. `backend/app/database.py` で FastAPI 本体が `DATABASE_URL` を読むことを確認する
3. `backend/alembic/env.py` で Alembic も同じ `DATABASE_URL` を使うことを確認する
4. `docker compose exec backend alembic current` / `upgrade head` で実際に migration 状態を確認する

## 動作確認で利用したコマンド

目的: Compose の既定値解決結果を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose config
```

目的: Step 15 の設定で 3 サービスを起動する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose up -d --build
```

目的: 起動中コンテナの状態を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose ps
```

目的: backend コンテナ内の Alembic が head を認識していることを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose exec backend alembic current
```

目的: backend コンテナ内で migration を明示実行しても失敗しないことを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose exec backend alembic upgrade head
```

目的: backend の `/health` が疎通できることを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health | Select-Object -ExpandProperty Content
```

目的: frontend の ESLint が通ることを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
npm run lint
```

目的: Compose 起動中の `/books` 画面を Step 15 用 Playwright で確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/docker-compose-env-migration.spec.ts
```

## Playwright テストの内容

- 対象: `frontend/e2e/docker-compose-env-migration.spec.ts`
- 確認内容:
  - Compose 起動中の `/books` へ遷移できる
  - URL が `/books` で終わる
  - `Book list` 見出しが表示される
- 実行コマンド:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/docker-compose-env-migration.spec.ts
```

- 保存したエビデンス:
  - `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step15-playwright\01-compose-env-books.png`

## 画面確認手順

1. `docker compose up -d --build` を実行する
2. ブラウザで `http://127.0.0.1:3000/books` を開く
3. 期待される遷移先URLが `http://127.0.0.1:3000/books` であることを確認する
4. 画面上に `Book list` 見出しと本一覧画面が表示されることを確認する

## このStepで理解してほしいこと

- Compose とアプリ本体で環境変数名をそろえると、設定の読み替えが減る
- `DATABASE_URL` は backend 本体だけでなく Alembic migration でも共通利用される
- `NEXT_PUBLIC_API_BASE_URL` と `INTERNAL_API_BASE_URL` は同じAPIを指していても役割が違う
- migration の「定義」と「実行確認」は別であり、Step 15では実行運用までそろえた
