"use client";

import { BookForm } from "@/components/BookForm";
import { updateBook } from "@/lib/api";
import type { Book, BookInput } from "@/types/book";

type EditBookFormProps = {
  book: Book;
};

export function EditBookForm({ book }: EditBookFormProps) {
  return (
    <BookForm
      initialBook={book}
      onSubmitBook={(bookInput: BookInput) => updateBook(book.id, bookInput)}
      submitLabel="更新する"
      submittingLabel="更新中"
    />
  );
}
