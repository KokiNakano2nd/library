# Step 16: Docker上での疎通確認
## このStepでやったこと
Step 16では、Docker Compose で起動した `frontend` `backend` `db` の3サービスが「起動しているだけ」でなく、実際に連携できていることを確認しました。  
特に、Next.js の server-side fetch が `backend` サービス名へ到達できることと、ブラウザから `NEXT_PUBLIC_API_BASE_URL` 経由で FastAPI へ直接アクセスしたときに CORS で失敗しないことを、同じ Playwright テストで確認できる形にしました。

Step 15までで環境変数と migration の整理は終わっていましたが、それだけでは「Compose 上の接続が本当に通るか」は保証できません。  
そこで Step 16では、`/books` 画面表示、`/health` API、`/api/books` API を Docker 起動中にまとめて検証する Step を追加しています。

## 追加・変更したファイル

| ファイル | 役割 |
| --- | --- |
| `frontend/e2e/docker-compose-connectivity.spec.ts` | Compose 起動中の画面表示と browser からの API 疎通を確認する Step 16 用 Playwright テスト |
| `ELPLANATION/EXPLANATION_STEP16.md` | Step 16 のコードレベル説明、確認コマンド、証跡、ブラウザ確認手順をまとめる |
| `LEARNING_ROADMAP.md` | Step 16 の完了チェックを反映する |
| `LEARNING_PROGRESS.md` | Step 16 完了、理解内容、確認結果、次の Step を記録する |

## 実装部分のコードレベル説明
### `frontend/e2e/docker-compose-connectivity.spec.ts`

```ts
const evidenceDir = path.resolve("../test/evidence/step16-playwright");
const apiBaseUrl =
  process.env.DOCKER_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

test("docker compose 起動中に画面表示と browser からの API 疎通が通る", async ({
  page,
}) => {
  await page.goto("/books");

  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();

  const healthResult = await page.evaluate(async (url) => {
    const response = await fetch(`${url}/health`);
    return {
      ok: response.ok,
      status: response.status,
      body: (await response.json()) as { status?: string },
    };
  }, apiBaseUrl);
});
```

このコードで何が起きているか:

- 入口: `npx playwright test e2e/docker-compose-connectivity.spec.ts`
- 引数: Playwright から受け取る `page`
- 戻り値: テスト関数なので値は返さず、成功時は pass、失敗時は assertion error になります
- state:
  - `evidenceDir`: Step 16 の証跡保存先
  - `apiBaseUrl`: ブラウザから直接アクセスする公開 API URL
- HTTPステータス:
  - `/books` は `200 OK` で画面表示される想定
  - `/health` は `200 OK`
  - `/api/books` は `200 OK`
- 内部処理の順番:
  1. `page.goto("/books")` で Compose 上の frontend へアクセスする
  2. `Book list` 見出しが見えることを確認する
  3. 画面に `Could not load books` が出ていないことを確認する
  4. `page.evaluate()` でブラウザ文脈の `fetch()` を実行し、`/health` を叩く
  5. もう一度ブラウザ文脈で `fetch()` を実行し、`/api/books` を叩く
  6. それぞれ `200 OK` かつ期待した JSON 形式で返ることを確認する
  7. 最後にスクリーンショットを保存する
- 呼び出し先:
  - Compose 上の Next.js `/books`
  - FastAPI `/health`
  - FastAPI `/api/books`
- 正常系:
  - `/books` が表示される
  - `/health` が `{"status":"ok"}` を返す
  - `/api/books` が配列 JSON を返す
- 異常系:
  - frontend が backend へつながらないと `/books` 側で `Could not load books` が表示される
  - CORS や公開 URL が壊れていると、ブラウザ文脈の `fetch()` が失敗して test が落ちる
  - backend が起動していないと `response.ok` が `false` か、接続例外になります

このテストが保証できること:

- Compose 起動中に frontend 画面が開くこと
- Next.js の server-side fetch が backend へ到達できること
- ブラウザから公開 API URL へ直接アクセスしても CORS で失敗しないこと
- backend の `/health` と `/api/books` が `200 OK` で返ること

このテストだけでは保証できないこと:

- 作成・更新・削除まで含む CRUD 全体
- DB の永続化内容が期待通り残ること
- 複数ブラウザや本番配備環境での動作

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

- 入口: `fetchBooks()` `createBook()` `updateBook()` `deleteBook()` などの API 通信関数
- 引数: 直接は受け取らず、環境変数と `window` の有無で分岐する
- 戻り値: 現在の実行場所に応じた API base URL
- state:
  - `BROWSER_API_BASE_URL`: ブラウザが見る公開 URL
  - `SERVER_API_BASE_URL`: Next.js サーバー実行時の内部 URL
- 内部処理の順番:
  1. サーバー実行なら `INTERNAL_API_BASE_URL` を使う
  2. ブラウザ実行なら `NEXT_PUBLIC_API_BASE_URL` を使う
- 呼び出し先: FastAPI の `/api/books` 系 API

Step 16 の `/books` 表示確認は、この `getApiBaseUrl()` が server-side で `http://backend:8000` を返せていることの確認でもあります。  
一方で、`page.evaluate()` 内の `fetch()` は Next.js を経由せずブラウザから直接 `http://127.0.0.1:8000` を叩くので、こちらは `NEXT_PUBLIC_API_BASE_URL` と CORS の確認になります。

### `backend/app/main.py`

```py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3011",
        "http://127.0.0.1:3011",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
```

このコードで何が起きているか:

- 入口:
  - ブラウザから backend へ送る CORS 対象リクエスト
  - `GET /health`
- 引数:
  - `CORSMiddleware` は許可オリジン設定を受け取る
  - `health_check()` は引数なし
- 戻り値:
  - `/health` は `{"status": "ok"}`
- HTTPステータス:
  - 正常系は `200 OK`
- 内部処理の順番:
  1. FastAPI 起動時に CORS ミドルウェアを登録する
  2. ブラウザから cross-origin リクエストが来るとミドルウェアが許可判定する
  3. `/health` への GET では `health_check()` が実行される
  4. JSON が返る
- 正常系:
  - `http://127.0.0.1:3000` からの browser fetch が許可される
  - `/health` が `200 OK` で応答する
- 異常系:
  - 許可オリジンに無い URL から叩くとブラウザ側で CORS エラーになる

Step 16 のテストは、この CORS 設定と `/health` エンドポイントの両方を Docker 起動中に実地確認する目的で使っています。

## どの順番でコードを読むと理解しやすいか
1. `LEARNING_ROADMAP.md` の Step 16 を読み、今回の完了条件を確認する
2. `docker-compose.yml` を読み、`frontend` `backend` `db` がどう接続されるか見る
3. `frontend/lib/api.ts` を読み、server-side と browser-side で API URL をどう切り替えるか理解する
4. `backend/app/main.py` を読み、CORS と `/health` の入口を確認する
5. `frontend/e2e/docker-compose-connectivity.spec.ts` を読み、何をもって疎通成功と判断したか確認する

## 動作確認で利用したコマンド
目的: Compose 設定が展開できることを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose config
```

目的: Step 16 の確認用に 3 サービスを起動する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose up -d --build
```

目的: Compose 上のサービス状態を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose ps
```

目的: backend の `/health` が `200 OK` を返すことを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health | Select-Object -ExpandProperty Content
```

目的: frontend の lint を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
npm run lint
```

目的: Step 16 用 Playwright テストで Compose 上の疎通を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/docker-compose-connectivity.spec.ts
```

## Playwrightテストの内容

- 対象: `frontend/e2e/docker-compose-connectivity.spec.ts`
- 確認内容:
  - Compose 起動中の `/books` 画面へ到達できる
  - 画面に `Could not load books` が出ていない
  - ブラウザから `/health` を直接叩いて `200 OK` と `{"status":"ok"}` を受け取れる
  - ブラウザから `/api/books` を直接叩いて `200 OK` と配列 JSON を受け取れる

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/docker-compose-connectivity.spec.ts
```

- 保存したエビデンス:
  - `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step16-playwright\01-docker-compose-connectivity-books.png`

## ブラウザで確認する操作手順
1. `docker compose up -d --build` を実行する
2. ブラウザで `http://127.0.0.1:3000/books` を開く
3. 期待される遷移先URLが `http://127.0.0.1:3000/books` であることを確認する
4. 画面上に `Book list` 見出しが表示されることを確認する
5. 画面上に `Could not load books` が表示されていないことを確認する

## このStepで理解してほしいこと

- Docker Compose の疎通確認では「コンテナが起動した」だけでは不十分で、画面・API・CORS を分けて見る必要がある
- `/books` の表示確認は Next.js server-side fetch と backend 接続の確認になる
- ブラウザ文脈の `fetch()` 確認は `NEXT_PUBLIC_API_BASE_URL` と CORS の確認になる
- 同じ FastAPI を見ていても、server-side 経路と browser-side 経路では壊れ方が違う
