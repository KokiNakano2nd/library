import type { LoginInput, LoginResponse } from "@/types/auth";
import type { Book, BookInput } from "@/types/book";

const BROWSER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? null;
const SERVER_API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return SERVER_API_BASE_URL;
  }

  if (BROWSER_API_BASE_URL !== null) {
    return BROWSER_API_BASE_URL;
  }

  return `${window.location.protocol}//${window.location.hostname}:8000`;
}

function getErrorDetail(errorBody: unknown): unknown {
  if (
    errorBody !== null &&
    typeof errorBody === "object" &&
    "detail" in errorBody
  ) {
    return errorBody.detail;
  }

  return null;
}

function getErrorMessage(
  status: number,
  detail: unknown,
  fallbackMessage: string,
): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (status === 404) {
    return "指定された本は見つかりません。";
  }

  if (status === 401) {
    return "この操作を行うにはログインが必要です。";
  }

  if (status === 403) {
    return "この操作は管理者だけが実行できます。";
  }

  if (status === 405) {
    return "APIがDELETEを受け付けていません。FastAPIサーバーが古いコードで動いている可能性があるため、再起動してください。";
  }

  if (status === 409) {
    return "同じISBNの本がすでに登録されています。";
  }

  if (status === 422) {
    return "入力内容を確認してください。";
  }

  return fallbackMessage;
}

export async function fetchBooks(): Promise<ApiResult<Book[]>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/books`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        message: "本の一覧取得に失敗しました。",
      };
    }

    const books: Book[] = await response.json();
    return { ok: true, data: books };
  } catch {
    return {
      ok: false,
      message: "APIに接続できませんでした。",
    };
  }
}

export async function loginUser(
  loginInput: LoginInput,
): Promise<ApiResult<LoginResponse>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginInput),
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => null);

      return {
        ok: false,
        message: getErrorMessage(
          response.status,
          getErrorDetail(errorBody),
          "ログインに失敗しました。",
        ),
      };
    }

    const loginResponse: LoginResponse = await response.json();
    return { ok: true, data: loginResponse };
  } catch {
    return {
      ok: false,
      message: "APIに接続できませんでした。",
    };
  }
}

export async function fetchBook(bookId: number): Promise<ApiResult<Book>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/books/${bookId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => null);

      return {
        ok: false,
        message: getErrorMessage(
          response.status,
          getErrorDetail(errorBody),
          "本の取得に失敗しました。",
        ),
      };
    }

    const book: Book = await response.json();
    return { ok: true, data: book };
  } catch {
    return {
      ok: false,
      message: "APIに接続できませんでした。",
    };
  }
}

export async function createBook(book: BookInput): Promise<ApiResult<Book>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/books`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => null);

      return {
        ok: false,
        message: getErrorMessage(
          response.status,
          getErrorDetail(errorBody),
          "本の登録に失敗しました。",
        ),
      };
    }

    const createdBook: Book = await response.json();
    return { ok: true, data: createdBook };
  } catch {
    return {
      ok: false,
      message: "APIに接続できませんでした。",
    };
  }
}

export async function updateBook(
  bookId: number,
  book: BookInput,
): Promise<ApiResult<Book>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/books/${bookId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => null);

      return {
        ok: false,
        message: getErrorMessage(
          response.status,
          getErrorDetail(errorBody),
          "本の更新に失敗しました。",
        ),
      };
    }

    const updatedBook: Book = await response.json();
    return { ok: true, data: updatedBook };
  } catch {
    return {
      ok: false,
      message: "APIに接続できませんでした。",
    };
  }
}

export async function deleteBook(bookId: number): Promise<ApiResult<null>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/books/${bookId}`, {
      credentials: "include",
      method: "DELETE",
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => null);

      return {
        ok: false,
        message: getErrorMessage(
          response.status,
          getErrorDetail(errorBody),
          "本の削除に失敗しました。",
        ),
      };
    }

    return { ok: true, data: null };
  } catch {
    return {
      ok: false,
      message: "APIに接続できませんでした。",
    };
  }
}
