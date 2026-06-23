"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createBook } from "@/lib/api";
import type { ApiResult } from "@/lib/api";
import type { Book, BookInput } from "@/types/book";

type FormState = {
  title: string;
  author: string;
  publishedYear: string;
  isbn: string;
};

const initialFormState: FormState = {
  title: "",
  author: "",
  publishedYear: "",
  isbn: "",
};

type BookFormProps = {
  initialBook?: Book;
  submitLabel?: string;
  submittingLabel?: string;
  onSubmitBook?: (bookInput: BookInput) => Promise<ApiResult<Book>>;
};

function getInitialFormState(initialBook?: Book): FormState {
  if (initialBook === undefined) {
    return initialFormState;
  }

  return {
    title: initialBook.title,
    author: initialBook.author,
    publishedYear:
      initialBook.published_year === null ? "" : String(initialBook.published_year),
    isbn: initialBook.isbn ?? "",
  };
}

function buildBookInput(formState: FormState): BookInput | string {
  const title = formState.title.trim();
  const author = formState.author.trim();
  const isbn = formState.isbn.trim();
  const publishedYearText = formState.publishedYear.trim();

  if (title === "" || author === "") {
    return "タイトルと著者名を入力してください。";
  }

  if (publishedYearText !== "") {
    const publishedYear = Number(publishedYearText);

    if (!Number.isInteger(publishedYear) || publishedYear < 1) {
      return "出版年は1以上の整数で入力してください。";
    }

    return {
      title,
      author,
      published_year: publishedYear,
      isbn: isbn === "" ? null : isbn,
    };
  }

  return {
    title,
    author,
    published_year: null,
    isbn: isbn === "" ? null : isbn,
  };
}

export function BookForm({
  initialBook,
  submitLabel = "登録する",
  submittingLabel = "登録中",
  onSubmitBook = createBook,
}: BookFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(() =>
    getInitialFormState(initialBook),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const bookInput = buildBookInput(formState);

    if (typeof bookInput === "string") {
      setMessage(bookInput);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const result = await onSubmitBook(bookInput);

    if (!result.ok) {
      setMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/books");
    router.refresh();
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <label>
        <span>タイトル</span>
        <input
          maxLength={255}
          name="title"
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          required
          type="text"
          value={formState.title}
        />
      </label>

      <label>
        <span>著者名</span>
        <input
          maxLength={255}
          name="author"
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              author: event.target.value,
            }))
          }
          required
          type="text"
          value={formState.author}
        />
      </label>

      <label>
        <span>出版年</span>
        <input
          min={1}
          name="publishedYear"
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              publishedYear: event.target.value,
            }))
          }
          type="number"
          value={formState.publishedYear}
        />
      </label>

      <label>
        <span>ISBN</span>
        <input
          maxLength={20}
          name="isbn"
          onChange={(event) =>
            setFormState((current) => ({
              ...current,
              isbn: event.target.value,
            }))
          }
          type="text"
          value={formState.isbn}
        />
      </label>

      {message !== null ? (
        <p className="form-message" role="alert">
          {message}
        </p>
      ) : null}

      <div className="form-actions">
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
