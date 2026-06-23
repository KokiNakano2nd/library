import Link from "next/link";

import { BookForm } from "@/components/BookForm";

export default function NewBookPage() {
  return (
    <main>
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Books</p>
          <h1>本の新規登録</h1>
        </div>
        <Link className="button-secondary" href="/books">
          一覧へ戻る
        </Link>
      </header>

      <BookForm />
    </main>
  );
}
