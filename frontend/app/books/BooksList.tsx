"use client";

import Link from "next/link";
import { useState } from "react";

import { deleteBook } from "@/lib/api";
import type { Book } from "@/types/book";

type BooksListProps = {
  canManageBooks: boolean;
  initialBooks: Book[];
};

function formatPublishedYear(publishedYear: number | null): string {
  return publishedYear === null ? "Not set" : String(publishedYear);
}

function formatIsbn(isbn: string | null): string {
  return isbn === null ? "Not set" : isbn;
}

export function BooksList({ canManageBooks, initialBooks }: BooksListProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDelete(book: Book): Promise<void> {
    const confirmed = window.confirm(`「${book.title}」を削除しますか？`);

    if (!confirmed) {
      return;
    }

    setDeletingBookId(book.id);
    setErrorMessage(null);

    const result = await deleteBook(book.id);

    if (!result.ok) {
      setErrorMessage(result.message);
      setDeletingBookId(null);
      return;
    }

    setBooks((currentBooks) =>
      currentBooks.filter((currentBook) => currentBook.id !== book.id),
    );
    setDeletingBookId(null);
  }

  if (books.length === 0) {
    return (
      <section className="status">
        <h2>No books registered</h2>
        <p>Registered books will appear here.</p>
      </section>
    );
  }

  return (
    <>
      {errorMessage !== null && (
        <section className="status status-error" aria-live="polite">
          <h2>Could not delete book</h2>
          <p>{errorMessage}</p>
        </section>
      )}

      <section className="book-list" aria-label="Book list">
        {books.map((book) => (
          <article className="book-item" key={book.id}>
            <div>
              <h2>{book.title}</h2>
              <p className="book-author">{book.author}</p>
            </div>
            <div className="book-item-side">
              <dl className="book-meta">
                <div>
                  <dt>Year</dt>
                  <dd>{formatPublishedYear(book.published_year)}</dd>
                </div>
                <div>
                  <dt>ISBN</dt>
                  <dd>{formatIsbn(book.isbn)}</dd>
                </div>
              </dl>
              {canManageBooks ? (
                <div className="book-actions">
                  <Link className="button-secondary" href={`/books/${book.id}/edit`}>
                    編集
                  </Link>
                  <button
                    className="button-danger"
                    disabled={deletingBookId !== null}
                    onClick={() => void handleDelete(book)}
                    type="button"
                  >
                    {deletingBookId === book.id ? "削除中" : "削除"}
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
