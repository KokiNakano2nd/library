import Link from "next/link";
import { redirect } from "next/navigation";

import { BooksList } from "@/app/books/BooksList";
import { fetchBooks } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/server-auth";

export default async function BooksPage() {
  const currentUser = await fetchCurrentUser();

  if (currentUser === null) {
    redirect("/login");
  }

  const result = await fetchBooks();

  if (!result.ok) {
    return (
      <main>
        <header className="page-header">
          <p className="eyebrow">Books</p>
          <h1>Book list</h1>
        </header>
        <section className="status status-error">
          <h2>Could not load books</h2>
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
          <h1>Book list</h1>
        </div>
        <div className="page-actions">
          <Link className="button-primary" href="/books/new">
            本を登録
          </Link>
        </div>
      </header>

      <BooksList initialBooks={result.data} />
    </main>
  );
}
