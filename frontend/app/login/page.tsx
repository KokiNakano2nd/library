import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/LoginForm";
import { fetchCurrentUser } from "@/lib/server-auth";

export default async function LoginPage() {
  const currentUser = await fetchCurrentUser();

  if (currentUser !== null) {
    redirect("/books");
  }

  return (
    <main>
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Auth</p>
          <h1>ログイン</h1>
          <p>管理操作を行うには、管理者アカウントでログインしてください。</p>
        </div>
        <Link className="button-secondary" href="/books">
          一覧へ戻る
        </Link>
      </header>

      <LoginForm />
    </main>
  );
}
