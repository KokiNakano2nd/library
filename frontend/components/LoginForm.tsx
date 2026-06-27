"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { loginUser } from "@/lib/api";

type FormState = {
  loginId: string;
  password: string;
};

const initialFormState: FormState = {
  loginId: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const loginId = formState.loginId.trim();
    const password = formState.password.trim();

    if (loginId === "" || password === "") {
      setMessage("ログインIDとパスワードを入力してください。");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const result = await loginUser({
      login_id: loginId,
      password,
    });

    if (!result.ok) {
      setMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/books");
    router.refresh();
  }

  return (
    <div className="auth-layout">
      <form className="book-form" onSubmit={handleSubmit}>
        <label>
          <span>ログインID</span>
          <input
            autoComplete="username"
            name="loginId"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                loginId: event.target.value,
              }))
            }
            placeholder="email または username"
            required
            type="text"
            value={formState.loginId}
          />
        </label>

        <label>
          <span>パスワード</span>
          <input
            autoComplete="current-password"
            name="password"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            required
            type="password"
            value={formState.password}
          />
        </label>

        {message !== null ? (
          <p className="form-message" role="alert">
            {message}
          </p>
        ) : null}

        <div className="form-actions">
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "ログイン中" : "ログインする"}
          </button>
        </div>
      </form>

      <section className="status">
        <h2>管理操作について</h2>
        <p>
          Step 27 では、ログイン成功後に <code>/books</code>{" "}
          へ戻り、管理者だけに本の登録・編集・削除導線を表示します。
        </p>
        <p>
          一覧へ戻る場合は <Link href="/books">/books</Link> を開いてください。
        </p>
      </section>
    </div>
  );
}
