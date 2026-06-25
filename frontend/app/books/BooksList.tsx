"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBook } from "@/lib/api";
import type { Book } from "@/types/book";

type BooksListProps = {
  initialBooks: Book[];
};

function formatPublishedYear(publishedYear: number | null): string {
  return publishedYear === null ? "未設定" : String(publishedYear);
}

function formatIsbn(isbn: string | null): string {
  return isbn === null ? "未設定" : isbn;
}

export function BooksList({ initialBooks }: BooksListProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [deleteTargetBook, setDeleteTargetBook] = useState<Book | null>(null);
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  function handleDialogOpenChange(open: boolean): void {
    if (open || deletingBookId !== null) {
      return;
    }

    setDeleteTargetBook(null);
  }

  return (
    <>
      {successMessage !== null ? (
        <section
          aria-live="polite"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {successMessage}
        </section>
      ) : null}

      {errorMessage !== null ? (
        <section className="status status-error" aria-live="polite">
          <h2>Could not delete book</h2>
          <p>{errorMessage}</p>
        </section>
      ) : null}

      {books.length === 0 ? (
        <section className="status">
          <h2>登録済みの本はありません</h2>
          <p>本を登録すると、この一覧に表示されます。</p>
        </section>
      ) : (
        <section
          aria-label="Book list"
          className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="px-4 pb-4 text-left">
                登録済みの本を一覧で確認できます。
              </TableCaption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>タイトル</TableHead>
                  <TableHead>著者名</TableHead>
                  <TableHead>出版年</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead className="w-[160px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="min-w-[220px] font-semibold text-slate-900">
                      {book.title}
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{formatPublishedYear(book.published_year)}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {formatIsbn(book.isbn)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                          href={`/books/${book.id}/edit`}
                        >
                          編集
                        </Link>
                        <Button
                          disabled={deletingBookId !== null}
                          onClick={() => {
                            setErrorMessage(null);
                            setSuccessMessage(null);
                            setDeleteTargetBook(book);
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          {deletingBookId === book.id ? "削除中" : "削除"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <Dialog
        onOpenChange={handleDialogOpenChange}
        open={deleteTargetBook !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>本を削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。削除対象:
              <span className="mt-2 block rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-900">
                {deleteTargetBook?.title}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={deletingBookId !== null} variant="secondary">
                キャンセル
              </Button>
            </DialogClose>
            <Button
              disabled={deletingBookId !== null}
              onClick={() => void handleDelete()}
              variant="destructive"
            >
              {deletingBookId !== null ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
