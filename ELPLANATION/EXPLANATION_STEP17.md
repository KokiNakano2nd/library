# Step 17: Playwright による Docker 環境の E2E 確認

## この Step でやったこと
Step 17 では、Docker Compose で起動した `frontend` `backend` `db` を相手に、Playwright で本の CRUD を最後まで通しました。  
Step 16 は「画面表示と基本疎通」の確認でしたが、Step 17 では「作成した本が一覧に出る」「編集が反映される」「削除で消える」までを 1 本の E2E で確認しています。

## 追加・変更したファイル

| ファイル | 役割 |
| --- | --- |
| `frontend/next.config.ts` | Docker 上の `next dev` を `127.0.0.1:3000` から開いたときに dev resource がブロックされないようにする |
| `frontend/e2e/docker-compose-books-crud.spec.ts` | Docker Compose 起動中の CRUD を確認する Step 17 用 Playwright テスト |
| `ELPLANATION/EXPLANATION_STEP17.md` | Step 17 のコード説明、確認コマンド、証跡、ブラウザ確認手順をまとめる |
| `LEARNING_ROADMAP.md` | Step 17 の完了チェックを反映する |
| `LEARNING_PROGRESS.md` | Step 17 完了、理解内容、証跡、次の Step を記録する |

## 実装部分のコードレベル説明

### `frontend/next.config.ts`

```ts
const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
};
```

このコードで何が起きているか:

- Docker の frontend コンテナは `next dev --hostname 0.0.0.0 --port 3000` で起動しています
- Playwright は Windows 側ブラウザから `http://127.0.0.1:3000` を開きます
- Next.js 16 の dev server は、許可していない origin からの `/_next/*` dev resource をブロックします
- この設定を入れないと HMR client などの dev resource が拒否され、client-side hydration が崩れます
- その結果、`BookForm` の `onSubmit` が効かず、フォーム送信が native GET に落ちることがあります
- この設定で保証できるのは「Docker 上の dev server を `127.0.0.1` 経由で見たときの dev resource 許可」です
- 本番 build の挙動や他の origin まで自動で許可するわけではありません

### `frontend/e2e/docker-compose-books-crud.spec.ts`

```ts
const apiBaseUrl =
  process.env.DOCKER_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const evidenceDir = path.resolve("../test/evidence/step17-playwright");

test("docker compose 起動中に本の CRUD を最後まで確認できる", async ({
  page,
  request,
}) => {
  const suffix = Date.now().toString();
  const createdTitle = `Docker Step17 ${suffix}`;
  const updatedTitle = `Docker Step17 Updated ${suffix}`;
  const isbn = `step17-${suffix.slice(-12)}`;
```

このコードで何が起きているか:

- 入口は `npx playwright test e2e/docker-compose-books-crud.spec.ts` です
- `page` はブラウザ操作、`request` は API での事前・事後クリーンアップに使います
- `apiBaseUrl` は browser ではなく Playwright の API client が呼ぶ FastAPI の URL です
- `evidenceDir` は Step 17 の証跡保存先です
- `suffix` を付けて毎回ユニークなタイトルと ISBN を作り、既存データとぶつからないようにしています
- ここではまだ UI を触っておらず、テスト全体で使う state を初期化している段階です

### `frontend/e2e/docker-compose-books-crud.spec.ts`

```ts
await page.goto("/books");
await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();

await page.locator('a[href="/books/new"]').click();
await page.locator('input[name="title"]').fill(createdTitle);
await page.locator('input[name="author"]').fill("Docker Playwright Tester");
await page.locator('input[name="publishedYear"]').fill("2026");
await page.locator('input[name="isbn"]').fill(isbn);
await page.locator('button[type="submit"]').click();
```

このコードで何が起きているか:

- まず `/books` に移動し、一覧画面が Docker 上の frontend で表示されることを確認します
- 次に `/books/new` に進み、作成フォームへ入力します
- selector は日本語ラベル文字列に依存せず、`href` や `name` 属性で取っています
- これにより UI 文言が多少変わっても、フォーム構造が同じならテストが壊れにくくなります
- 正常系では submit 後に `/books` へ戻り、作成したタイトルが一覧に見える状態になります
- 異常系では URL 遷移や見出し確認で失敗し、どこで壊れたかが Playwright の assertion error で分かります

### `frontend/e2e/docker-compose-books-crud.spec.ts`

```ts
const createdBookItem = page.locator("article").filter({ hasText: createdTitle });
await createdBookItem.locator('a[href$="/edit"]').click();
await page.locator('input[name="title"]').fill(updatedTitle);
await page.locator('button[type="submit"]').click();

page.once("dialog", async (dialog) => {
  expect(dialog.message()).toContain(updatedTitle);
  await dialog.accept();
});

const updatedBookItem = page.locator("article").filter({ hasText: updatedTitle });
await updatedBookItem.getByRole("button").click();
```

このコードで何が起きているか:

- 作成後は `article` の中から作成済みタイトルを含む要素を探し、その本だけを対象に編集リンクを押します
- 編集画面ではタイトルだけを変更して submit し、更新後に一覧へ戻って差し替わったことを見ます
- 削除では `window.confirm()` が出るので、`page.once("dialog")` で 1 回だけ受け取り `accept()` しています
- ここで dialog 文言に更新後タイトルが含まれることも確認しているため、「違う本を消していないか」の確認にもなります
- 削除成功時は一覧から対象タイトルが消えます
- FastAPI の HTTP ステータス自体は UI から直接見えませんが、一覧反映まで確認することで UI / API / DB の横断確認になります

### `frontend/e2e/docker-compose-books-crud.spec.ts`

```ts
async function deleteBooksByIsbn(
  request: APIRequestContext,
  isbn: string,
): Promise<void> {
  const response = await request.get(`${apiBaseUrl}/api/books`);

  if (!response.ok()) {
    return;
  }

  const books = (await response.json()) as BookResponse[];
  const targetBooks = books.filter((book) => book.isbn === isbn);

  for (const book of targetBooks) {
    await request.delete(`${apiBaseUrl}/api/books/${book.id}`);
  }
}
```

このコードで何が起きているか:

- この関数の入口はテスト本体の開始前と終了後です
- 引数は `request` と `isbn` で、戻り値は `Promise<void>` です
- `/api/books` を呼び、同じ ISBN を持つ本が残っていたら削除します
- 事前クリーンアップで「前回失敗の残骸」による `409` を避けます
- 事後クリーンアップで「今回テストの残骸」を残しにくくします
- ただし `/api/books` 自体が落ちている場合は何も消せません
- つまり、この関数が保証できるのは「API が生きている範囲での後始末」であり、backend 停止時の完全清掃までは保証しません

## まずどの順番でコードを読むとよいか
1. `frontend/e2e/docker-compose-books-crud.spec.ts` の `test(...)` を読む
2. その中の create -> update -> delete の流れを追う
3. 次に `saveEvidence()` を読んで証跡保存先を確認する
4. 最後に `deleteBooksByIsbn()` を読んで、なぜ API cleanup が必要かを理解する

## 動作確認で利用したコマンド

目的: Compose 設定が正しい形に展開されることを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose config
```

目的: Step 17 の確認用に 3 サービスを Docker Compose で起動する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose up -d --build
```

目的: 起動中コンテナの状態を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
docker compose ps
```

目的: frontend の lint を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
npm run lint
```

目的: Step 17 用 Playwright テストで Docker 環境の CRUD を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/docker-compose-books-crud.spec.ts
```

## Playwright テストの内容

- 対象: `frontend/e2e/docker-compose-books-crud.spec.ts`
- 確認内容:
  - `/books` 一覧画面が Docker 上で開ける
  - `/books/new` から本を作成できる
  - 作成した本を編集できる
  - 更新した本を削除できる
  - 各操作の画面証跡が `test/evidence/step17-playwright` に保存される

実行コマンド:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
npx playwright test e2e/docker-compose-books-crud.spec.ts
```

保存したエビデンス:

- `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step17-playwright\01-books-initial.png`
- `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step17-playwright\02-book-created.png`
- `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step17-playwright\03-book-updated.png`
- `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step17-playwright\04-book-deleted.png`

## ブラウザで確認する操作手順
1. `docker compose up -d --build` を実行する
2. ブラウザで `http://127.0.0.1:3000/books` を開く
3. 新規作成画面へ進み、以下を入力する
   - title: `Manual Step17 Sample`
   - author: `Manual Tester`
   - publishedYear: `2026`
   - isbn: `manual-step17-sample`
4. 作成後に `http://127.0.0.1:3000/books` へ戻り、入力した本が表示されることを確認する
5. その本の編集画面へ進み、title を `Manual Step17 Updated` に変えて保存する
6. 一覧へ戻って更新内容が反映されることを確認する
7. 削除ボタンを押し、確認ダイアログで承認する
8. 一覧から対象本が消えることを確認する

## この Step で理解してほしいこと

- Step 16 の疎通確認だけでは、CRUD 全体の回帰は検出しきれません
- Step 17 の E2E は UI、Next.js ルーティング、FastAPI、PostgreSQL をまとめて確認する役割です
- Docker 化のあとに「API は生きているが画面操作で壊れる」ケースを捕まえるには、この種類のテストが必要です
- Next.js dev server をコンテナで使うときは、画面 URL と dev resource の origin 制約も確認対象になります
