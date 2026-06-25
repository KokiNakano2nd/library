# Step 30: shadcn/ui で図書一覧画面と削除確認 UI を改善

## この Step でやること

Step 30 では、`/books` の一覧画面をカード表示から `shadcn/ui` の `Table` ベースへ変更し、削除確認を `window.confirm` から `Dialog` ベースへ置き換える。

今回の方針は次の通りです。

- 既存の books API や認可仕様は変えず、frontend の見せ方だけを小さく改善する
- `shadcn/ui` の導入に必要な最小構成だけを追加する
- 一覧画面では本を表形式で見比べやすくする
- 削除時は対象タイトルを `Dialog` に明示し、誤操作を減らす
- 削除完了後は成功メッセージを表示し、状態変化を分かりやすくする

## 追加・変更したファイル

| ファイル | 役割 |
| --- | --- |
| `frontend/package.json` | `shadcn/ui` ベース実装に必要な依存関係を追加する |
| `frontend/postcss.config.mjs` | Tailwind CSS v4 を Next.js から使う設定 |
| `frontend/components.json` | `shadcn/ui` のコンポーネント配置ルールを記録する |
| `frontend/lib/utils.ts` | `clsx` と `tailwind-merge` を使った `cn()` helper |
| `frontend/components/ui/button.tsx` | 画面内で再利用する button wrapper |
| `frontend/components/ui/table.tsx` | `shadcn/ui` 風の table wrapper |
| `frontend/components/ui/dialog.tsx` | 削除確認で使う dialog wrapper |
| `frontend/app/globals.css` | Tailwind CSS を読み込み、既存 CSS と共存させる |
| `frontend/app/books/BooksList.tsx` | 一覧表示、削除確認、削除成功メッセージの本体 |
| `frontend/e2e/books-crud.spec.ts` | Table 行と Dialog を前提にしたローカル Playwright CRUD テスト |
| `frontend/e2e/docker-compose-books-crud.spec.ts` | Compose 向け CRUD テストも同じ UI に追従させる |
| `README.md` | `/books` の画面仕様と frontend のフォルダ構成を更新する |
| `LEARNING_ROADMAP.md` | Step 30 を追加する |
| `LEARNING_PROGRESS.md` | Step 30 の進捗と学びを更新する |

## 処理の流れ

```mermaid
flowchart TD
    A[books page を表示] --> B[BooksList が books 配列を state へ載せる]
    B --> C[Table で タイトル / 著者名 / 出版年 / ISBN / 操作 を表示]
    C --> D{削除ボタンを押したか}
    D -- No --> E[一覧表示を継続]
    D -- Yes --> F[deleteTargetBook に対象本を保存]
    F --> G[Dialog を開く]
    G --> H{削除を確定したか}
    H -- No --> I[Dialog を閉じる]
    H -- Yes --> J[DELETE /api/books/{id}]
    J --> K{API 成功か}
    K -- Yes --> L[state から対象本を除外]
    L --> M[成功メッセージを表示]
    K -- No --> N[エラーメッセージを表示]
```

## コードレベル説明

### `frontend/app/books/BooksList.tsx`

```tsx
const [books, setBooks] = useState<Book[]>(initialBooks);
const [deleteTargetBook, setDeleteTargetBook] = useState<Book | null>(null);
const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
const [successMessage, setSuccessMessage] = useState<string | null>(null);
```

このコードで何が起きているか:

- `initialBooks` を初期 state に入れ、削除後は再 fetch せず画面上の一覧だけ更新できるようにしている
- `deleteTargetBook` は Dialog に表示する対象本そのものを持つ
- `deletingBookId` は削除中の二重送信防止に使う
- `errorMessage` と `successMessage` を分けることで、失敗時と成功時の表示を切り替えやすくしている

```tsx
async function handleDelete(): Promise<void> {
  if (deleteTargetBook === null) {
    return;
  }

  setDeletingBookId(deleteTargetBook.id);
  setErrorMessage(null);
  setSuccessMessage(null);

  const result = await deleteBook(deleteTargetBook.id);

  if (!result.ok) {
    setErrorMessage(result.message);
    setDeletingBookId(null);
    return;
  }

  setBooks((currentBooks) =>
    currentBooks.filter((currentBook) => currentBook.id !== deleteTargetBook.id),
  );
  setSuccessMessage(`「${deleteTargetBook.title}」を削除しました。`);
  setDeletingBookId(null);
  setDeleteTargetBook(null);
}
```

このコードで何が起きているか:

- 入口は Dialog 内の `削除する` ボタン
- 引数は受け取らず、state に入れてある `deleteTargetBook` を使う
- `deleteBook()` は `DELETE /api/books/{id}` を呼び出す frontend API 関数
- 正常系では一覧 state から対象本を除外し、成功メッセージを表示して Dialog を閉じる
- 異常系では API から返ってきた日本語メッセージを `errorMessage` に載せ、一覧は変更しない
- HTTP ステータスの分岐自体は `lib/api.ts` 側で `ApiResult` に吸収しているため、この関数は `ok / not ok` の二択で読める

```tsx
<Table>
  <TableHeader>
    <TableRow className="hover:bg-transparent">
      <TableHead>タイトル</TableHead>
      <TableHead>著者名</TableHead>
      <TableHead>出版年</TableHead>
      <TableHead>ISBN</TableHead>
      {canManageBooks ? <TableHead className="w-[160px]">操作</TableHead> : null}
    </TableRow>
  </TableHeader>
  <TableBody>
    {books.map((book) => (
      <TableRow key={book.id}>
```

このコードで何が起きているか:

- 一覧の入口は `BooksPage` から渡される `canManageBooks` と `initialBooks`
- `Table` `TableHeader` `TableBody` `TableRow` `TableHead` `TableCell` を分けることで、HTML の `table` 構造を崩さずに再利用しやすくしている
- 管理者以外では `操作` 列ごと消し、既存の認可導線を UI 上でも維持している
- タイトルは最初の列に置き、一覧を見たときに何の本かを最優先で読める構成にしている

```tsx
<Dialog
  onOpenChange={handleDialogOpenChange}
  open={deleteTargetBook !== null}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>本を削除しますか？</DialogTitle>
      <DialogDescription>
        この操作は取り消せません。削除対象:
```

このコードで何が起きているか:

- 削除確認の入口は一覧行の `削除` ボタン
- `open={deleteTargetBook !== null}` としているため、対象本が決まったときだけ Dialog が開く
- `handleDialogOpenChange()` では、削除中に誤って閉じないように制御している
- `DialogDescription` に対象タイトルを表示し、`window.confirm` よりも「何を消すのか」を把握しやすくしている

### `frontend/components/ui/table.tsx`

```tsx
export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("min-w-full caption-bottom text-sm", className)} {...props} />;
}
```

このコードで何が起きているか:

- 入口は `BooksList.tsx` などからの JSX 利用
- 戻り値は通常の `table` 要素だが、見た目を Tailwind class で統一している
- `cn()` を使って呼び出し側の `className` 追加と共通 class の結合を簡単にしている
- 保証できることは「table 構造を簡単にそろえること」であり、並び替えやページネーションのような高度な表機能までは持たない

### `frontend/components/ui/dialog.tsx`

```tsx
export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl",
          className,
        )}
        {...props}
      >
```

このコードで何が起きているか:

- 入口は `BooksList.tsx` の `DialogContent`
- Radix UI の `Portal` と `Overlay` を使い、背景を inert にした確認 UI を作っている
- 幅は `w-[min(92vw,32rem)]` に固定し、モバイルでも画面外にはみ出しにくくしている
- この wrapper は削除確認に限らず他の確認モーダルにも再利用できる

## 動作確認で使ったコマンド

### frontend の lint を確認する

実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
npm.cmd run lint
```

### frontend の build を確認する

実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\frontend`

```powershell
npm.cmd run build
```

### 一時 SQLite DB で backend / frontend を起動し、Step 30 の Playwright CRUD を確認する

実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
$ErrorActionPreference='Stop'
$backendDir=Resolve-Path '.\backend'
$frontendDir=Resolve-Path '.\frontend'
$evidenceDir=Resolve-Path '.\test\evidence'
$env:DATABASE_URL='sqlite:///./step30_playwright.db'
Remove-Item -LiteralPath (Join-Path $backendDir 'step30_playwright.db') -ErrorAction SilentlyContinue
Push-Location $backendDir
try {
    .\.venv\Scripts\alembic.exe upgrade head
}
finally {
    Pop-Location
}
$backendProcess = Start-Process -FilePath (Join-Path $backendDir '.venv\Scripts\python.exe') -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000' -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru
$frontendProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','start','--','--hostname','127.0.0.1','--port','3011' -WorkingDirectory $frontendDir -WindowStyle Hidden -PassThru
try {
    $env:PLAYWRIGHT_EVIDENCE_DIR = Join-Path $evidenceDir 'step30-playwright'
    $env:PLAYWRIGHT_API_BASE_URL = 'http://127.0.0.1:8000'
    Push-Location $frontendDir
    try {
        npx playwright test e2e/books-crud.spec.ts
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($frontendProcess -ne $null) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($backendProcess -ne $null) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
```

## Playwright テスト内容

`frontend/e2e/books-crud.spec.ts` では次を確認している。

- `POST /api/admin/bootstrap` で空の一時 DB に管理者を 1 件作成できる
- `POST /api/auth/login` 後に `/books` で管理者導線を使える
- 本の新規登録後に `Table` の行として表示される
- 編集後に新しいタイトルへ置き換わる
- 削除ボタンで `Dialog` が開き、対象タイトルが表示される
- `削除する` を押すと行が消え、成功メッセージが表示される

## 保存した証跡

- `test/evidence/step30-playwright/01-books-initial.png`
- `test/evidence/step30-playwright/02-book-created.png`
- `test/evidence/step30-playwright/03-book-updated.png`
- `test/evidence/step30-playwright/04-delete-dialog.png`
- `test/evidence/step30-playwright/05-book-deleted.png`

## ブラウザで確認するときの見方

1. `/books` を開き、`本を登録` から本を 1 件作成する
2. 一覧がカードではなく表形式で表示され、列に `タイトル` `著者名` `出版年` `ISBN` `操作` が並ぶことを確認する
3. 対象行の `削除` を押し、Dialog に削除対象タイトルが表示されることを確認する
4. `削除する` を押し、Dialog が閉じたあとに対象行が消え、成功メッセージが表示されることを確認する

期待される URL と結果:

- 一覧表示後の URL: `/books`
- 編集画面への遷移時の URL: `/books/{id}/edit`
- 削除確認中: URL は `/books` のまま変わらず、Dialog だけが重なる
- 削除完了後: `/books` のままで対象行が消える

## ここで保証できること / できないこと

保証できること:

- frontend 単体の見た目変更ではなく、Next.js 画面から FastAPI の CRUD までつないだ状態で Table と Dialog の動作を確認できる
- 管理者だけに操作列を見せる既存条件を崩していない
- 削除対象タイトルを確認してから削除する UI に変わっている

この Step だけでは保証できないこと:

- Compose 上の `frontend/e2e/docker-compose-books-crud.spec.ts` を今回ローカル実行したわけではない
- 検索、並び替え、ページネーションのような複雑な表機能は追加していない
- 削除取り消し後の監査ログ挙動は変えていない
