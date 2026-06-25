"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, startTransition, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  NotebookPen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBook } from "@/lib/api";
import type { ApiResult } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Book, BookInput } from "@/types/book";

type FormState = {
  title: string;
  author: string;
  publishedYear: string;
  isbn: string;
};

type FieldName = keyof FormState;
type FieldErrors = Partial<Record<FieldName, string>>;

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
  successMessage?: string;
  onSubmitBook?: (bookInput: BookInput) => Promise<ApiResult<Book>>;
};

type ValidationResult =
  | {
      ok: true;
      data: BookInput;
    }
  | {
      ok: false;
      fieldErrors: FieldErrors;
      message: string;
    };

const fieldMeta: Record<
  FieldName,
  {
    description: string;
    label: string;
    placeholder: string;
    required: boolean;
    type: "number" | "text";
  }
> = {
  title: {
    label: "タイトル",
    description: "一覧で最初に目に入る名前です。正式名称で入力してください。",
    placeholder: "例: Webアプリ開発入門",
    required: true,
    type: "text",
  },
  author: {
    label: "著者名",
    description: "姓と名の間の表記ゆれを避けると、後で探しやすくなります。",
    placeholder: "例: 山田 太郎",
    required: true,
    type: "text",
  },
  publishedYear: {
    label: "出版年",
    description: "分かる場合だけ入力してください。1以上の整数を受け付けます。",
    placeholder: "例: 2026",
    required: false,
    type: "number",
  },
  isbn: {
    label: "ISBN",
    description: "任意項目です。同じ ISBN は重複登録できません。",
    placeholder: "例: 9780000000000",
    required: false,
    type: "text",
  },
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

function buildBookInput(formState: FormState): ValidationResult {
  const title = formState.title.trim();
  const author = formState.author.trim();
  const isbn = formState.isbn.trim();
  const publishedYearText = formState.publishedYear.trim();
  const fieldErrors: FieldErrors = {};

  if (title === "") {
    fieldErrors.title = "タイトルを入力してください。";
  }

  if (author === "") {
    fieldErrors.author = "著者名を入力してください。";
  }

  if (publishedYearText !== "") {
    const publishedYear = Number(publishedYearText);

    if (!Number.isInteger(publishedYear) || publishedYear < 1) {
      fieldErrors.publishedYear = "出版年は1以上の整数で入力してください。";
    } else if (Object.keys(fieldErrors).length === 0) {
      return {
        ok: true,
        data: {
          title,
          author,
          published_year: publishedYear,
          isbn: isbn === "" ? null : isbn,
        },
      };
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      fieldErrors,
      message: "入力内容を確認してください。",
    };
  }

  return {
    ok: true,
    data: {
      title,
      author,
      published_year: null,
      isbn: isbn === "" ? null : isbn,
    },
  };
}

export function BookForm({
  initialBook,
  submitLabel = "登録する",
  submittingLabel = "登録中",
  successMessage = "登録が完了しました。一覧へ移動します。",
  onSubmitBook = createBook,
}: BookFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(() =>
    getInitialFormState(initialBook),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function updateField(name: FieldName, value: string): void {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => {
      if (current[name] === undefined) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationResult = buildBookInput(formState);

    if (!validationResult.ok) {
      setFieldErrors(validationResult.fieldErrors);
      setMessage(validationResult.message);
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setIsSuccess(false);
    setFieldErrors({});

    const result = await onSubmitBook(validationResult.data);

    if (!result.ok) {
      setMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setMessage(successMessage);
    startTransition(() => {
      router.push("/books");
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden border-slate-200/80">
      <CardHeader className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_40%),linear-gradient(180deg,_rgba(248,250,252,0.96)_0%,_rgba(255,255,255,0.96)_100%)]">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
            <NotebookPen className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <CardTitle>図書情報を入力</CardTitle>
            <CardDescription>
              必須項目を先に入力し、必要に応じて出版年と ISBN を補足してください。
              入力内容は登録後すぐに一覧へ反映されます。
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-950">優先入力</p>
            <p>タイトル、著者名</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">任意入力</p>
            <p>出版年、ISBN</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950">保存先</p>
            <p>登録後は図書一覧へ戻ります</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {(
            [
              "title",
              "author",
              "publishedYear",
              "isbn",
            ] as FieldName[]
          ).map((fieldName) => {
            const meta = fieldMeta[fieldName];
            const errorMessage = fieldErrors[fieldName];
            const inputId = `book-form-${fieldName}`;
            const descriptionId = `${inputId}-description`;
            const errorId = `${inputId}-error`;

            return (
              <label className="block space-y-2" htmlFor={inputId} key={fieldName}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-950">
                    {meta.label}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      meta.required
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {meta.required ? "必須" : "任意"}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-600" id={descriptionId}>
                  {meta.description}
                </p>
                <Input
                  aria-describedby={
                    errorMessage === undefined
                      ? descriptionId
                      : `${descriptionId} ${errorId}`
                  }
                  aria-invalid={errorMessage !== undefined}
                  className={cn(
                    errorMessage !== undefined &&
                      "border-rose-300 bg-rose-50 focus-visible:border-rose-500 focus-visible:ring-rose-100",
                  )}
                  id={inputId}
                  maxLength={
                    fieldName === "publishedYear"
                      ? undefined
                      : fieldName === "isbn"
                        ? 20
                        : 255
                  }
                  min={fieldName === "publishedYear" ? 1 : undefined}
                  name={fieldName}
                  onChange={(event) => updateField(fieldName, event.target.value)}
                  placeholder={meta.placeholder}
                  required={meta.required}
                  type={meta.type}
                  value={formState[fieldName]}
                />
                {errorMessage !== undefined ? (
                  <p
                    className="flex items-center gap-2 text-sm font-medium text-rose-600"
                    id={errorId}
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errorMessage}
                  </p>
                ) : null}
              </label>
            );
          })}

          {message !== null ? (
            <section
              aria-live="polite"
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
                isSuccess
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700",
              )}
            >
              {isSuccess ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p>{message}</p>
            </section>
          ) : null}

          <CardFooter className="justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
            <p className="text-sm leading-6 text-slate-600">
              保存前に、タイトルと著者名の表記ゆれがないか確認してください。
            </p>
            <Button className="min-w-36" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  {submittingLabel}
                </span>
              ) : (
                submitLabel
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
