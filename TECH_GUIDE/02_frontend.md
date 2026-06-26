# フロントエンド技術ガイド

TypeScript / React / Next.js

---

## 1. TypeScript

### TypeScript とは

JavaScript に「型」を追加した言語。  
書いたコードは最終的に JavaScript に変換されて動きます。

```
TypeScript（.ts / .tsx）→ コンパイル → JavaScript（.js）→ ブラウザで実行
```

型を書くことで「存在しないプロパティにアクセスしようとしたらエラー」のように  
バグを実行前に検出できます。

---

### 基本的な型

```typescript
// プリミティブ型
const name: string = "山田太郎";
const year: number = 2024;
const isActive: boolean = true;

// null になりうる型
const isbn: string | null = null;   // string または null

// 配列
const books: Book[] = [];

// オブジェクトの型（interface）
interface Book {
    id: number;
    title: string;
    author: string;
    publishedYear: number | null;
    isbn: string | null;
}
```

---

### Union 型（`|` でつなぐ）

「AかBのどちらかである」型を表します。

```typescript
// string か null
const isbn: string | null = null;

// ok が true のときは data を持つ、false のときは message を持つ
type ApiResult<T> =
    | { ok: true; data: T }        // 成功パターン
    | { ok: false; message: string }; // 失敗パターン
```

`<T>` はジェネリクス（汎用型）。呼び出すときに具体的な型を指定します：

```typescript
const result: ApiResult<Book> = await fetchBook(1);
// ↑ T = Book として使う

if (result.ok) {
    console.log(result.data.title);  // data は Book 型
} else {
    console.log(result.message);     // message は string 型
}
```

---

### 型アサーション不要なパターン（Discriminated Union）

`ApiResult<T>` のように `ok` フィールドで型を絞り込める設計を  
**判別可能なユニオン型**（Discriminated Union）と呼びます。

```typescript
const result: ApiResult<Book[]> = await fetchBooks();

if (result.ok) {
    // この中では result.data が使える（TypeScript が自動で型を絞り込む）
    result.data.map(book => book.title);
} else {
    // この中では result.message が使える
    console.error(result.message);
}
```

---

## 2. React

### React とは

UI（画面）を「コンポーネント」という部品単位で作るライブラリ。  
各コンポーネントは「状態（state）が変わったら自動で画面を再描画」します。

---

### JSX（JavaScript + HTML）

React では JavaScript の中に HTML を書けます（これを JSX と呼ぶ）。

```tsx
// 通常の関数だが、HTML っぽいものを返す
function BookCard({ book }: { book: Book }) {
    return (
        <div className="card">
            <h2>{book.title}</h2>      {/* {} の中は JavaScript 式 */}
            <p>{book.author}</p>
        </div>
    );
}
```

---

### useState（状態管理）

コンポーネントが「覚えておくべき値」を管理します。  
状態が変わると React が自動で画面を再描画します。

```tsx
import { useState } from "react";

function Counter() {
    // [現在の値, 値を変える関数] = useState(初期値)
    const [count, setCount] = useState(0);

    return (
        <button onClick={() => setCount(count + 1)}>
            クリック数: {count}
        </button>
    );
}
```

**このプロジェクトでの例**（`BookForm.tsx`）:
```tsx
const [formState, setFormState] = useState<FormState>({
    title: "",
    author: "",
    publishedYear: "",
    isbn: "",
});

// 入力欄が変わるたびに状態を更新
<input
    value={formState.title}
    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
/>
```

`{ ...formState, title: e.target.value }` は「既存の値を全部コピーして、title だけ上書き」という意味（スプレッド構文）。

---

### イベントハンドリング

```tsx
// クリックイベント
<button onClick={() => handleDelete(book.id)}>削除</button>

// フォーム送信（ページリロードを防ぐ）
<form onSubmit={(e) => {
    e.preventDefault();   // デフォルトのページリロードをキャンセル
    handleSubmit();
}}>
```

---

## 3. Next.js

### Next.js とは

React をベースにした「フルスタック Web フレームワーク」。  
React だけでは「ページのルーティング」「サーバーサイドレンダリング」などを自分で設定する必要がありますが、Next.js はこれを自動で提供します。

---

### App Router とファイルベースルーティング

`app/` フォルダのディレクトリ構造が自動でURLになります。

```
app/
├── page.tsx        → / （トップページ）
├── login/
│   └── page.tsx    → /login
└── books/
    ├── page.tsx    → /books （本の一覧）
    ├── new/
    │   └── page.tsx → /books/new （本の登録）
    └── [id]/
        └── page.tsx → /books/123 （本の詳細。[id] は動的）
```

---

### Server Components と Client Components

Next.js の重要な概念。コンポーネントが「サーバーで動くか」「ブラウザで動くか」を選べます。

| | Server Component | Client Component |
|---|---|---|
| 宣言 | デフォルト（何も書かない） | `"use client"` を先頭に書く |
| 動く場所 | サーバー（Node.js） | ブラウザ |
| できること | DB アクセス、Cookie 読み取り | useState、onClick などのインタラクション |
| できないこと | useState、onClick | Cookie 読み取り（直接） |

---

**このプロジェクトでの例**（`books/page.tsx` — Server Component）:
```tsx
// "use client" がない → Server Component
export default async function BooksPage() {
    const currentUser = await fetchCurrentUser();  // サーバーで Cookie を読む

    if (currentUser === null) {
        redirect("/login");  // サーバーサイドリダイレクト
    }

    const result = await fetchBooks();  // サーバーから API を呼ぶ

    return (
        <main>
            <BooksList initialBooks={result.data} />  {/* Client Component に渡す */}
        </main>
    );
}
```

**Client Component の例**（`BookForm.tsx`）:
```tsx
"use client";  // ← これでブラウザで動くコンポーネントになる

import { useState } from "react";

export function BookForm() {
    const [formState, setFormState] = useState(...);  // useState が使える
    // ...
}
```

---

### サーバーとクライアントで違う API の URL

**このプロジェクトでの仕組み**（`lib/api.ts`）:
```typescript
function getApiBaseUrl(): string {
    if (typeof window === "undefined") {
        // サーバーで動いている（window オブジェクトが存在しない）
        return "http://backend:8000";  // Docker のコンテナ名でアクセス
    }
    // ブラウザで動いている
    return `${window.location.protocol}//${window.location.hostname}:8000`;
}
```

`typeof window === "undefined"` が `true` = サーバー環境  
`typeof window === "undefined"` が `false` = ブラウザ環境

---

### `import "server-only"`

```typescript
import "server-only";  // このファイルがブラウザでインポートされたらエラーにする

export async function fetchCurrentUser() {
    // Cookie を読む処理（サーバーのみ）
}
```

間違ってブラウザ側のコンポーネントからインポートするとビルドエラーになり、  
「サーバーの秘密情報がブラウザに漏れる」バグを防げます。

---

### Server Component から API を呼ぶときの Cookie の扱い

ブラウザは自動で Cookie を送りますが、Next.js サーバーから FastAPI を呼ぶ場合は  
手動で Cookie を転送する必要があります。

```typescript
// lib/server-auth.ts
const cookieStore = await cookies();     // Next.js の Cookie 読み取りAPI
const tokenCookie = cookieStore.get("access_token");

const response = await fetch(`http://backend:8000/api/auth/me`, {
    headers: {
        Cookie: `access_token=${tokenCookie.value}`,  // 手動で転送
    },
});
```

---

### startTransition

```typescript
import { startTransition } from "react";
import { useRouter } from "next/navigation";

const router = useRouter();

// ページ遷移を「トランジション」として扱う
startTransition(() => {
    router.push("/books");
});
```

`startTransition` を使わずに `router.push()` を呼ぶと、  
Next.js がページ遷移中に古いコンテンツを即座に消してしまうことがあります。  
`startTransition` を使うと「遷移が完了するまで現在のページを表示し続ける」動作になります。
