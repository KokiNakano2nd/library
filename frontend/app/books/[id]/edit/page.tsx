import Link from "next/link";
import { redirect } from "next/navigation";

import { fetchBook } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/server-auth";

import { EditBookForm } from "./EditBookForm";

type EditBookPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBookPage({ params }: EditBookPageProps) {
  const currentUser = await fetchCurrentUser();

  if (currentUser === null) {
    redirect("/login");
  }

  const { id } = await params;
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId < 1) {
    return (
      <main>
        <header className="page-header page-header-row">
          <div>
            <p className="eyebrow">Books</p>
            <h1>本の編集</h1>
          </div>
          <Link className="button-secondary" href="/books">
            一覧へ戻る
          </Link>
        </header>

        <section className="status status-error">
          <h2>本を正しく特定できませんでした</h2>
          <p>URL の ID を確認してください。</p>
        </section>
      </main>
    );
  }

  const result = await fetchBook(bookId);

  if (!result.ok) {
    return (
      <main>
        <header className="page-header page-header-row">
          <div>
            <p className="eyebrow">Books</p>
            <h1>本の編集</h1>
          </div>
          <Link className="button-secondary" href="/books">
            一覧へ戻る
          </Link>
        </header>

        <section className="status status-error">
          <h2>本を取得できませんでした</h2>
          <p>{result.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Books</p>
          <h1>本の編集</h1>
        </div>
        <Link className="button-secondary" href="/books">
          一覧へ戻る
        </Link>
      </header>

      <EditBookForm book={result.data} />
    </main>
  );
}
