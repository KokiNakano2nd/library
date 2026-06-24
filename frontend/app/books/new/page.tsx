import Link from "next/link";

import { BookForm } from "@/components/BookForm";
import { fetchCurrentUser, isAdminUser } from "@/lib/server-auth";

export default async function NewBookPage() {
  const currentUser = await fetchCurrentUser();
  const canManageBooks = isAdminUser(currentUser);

  return (
    <main>
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Books</p>
          <h1>本の新規登録</h1>
        </div>
        <Link className="button-secondary" href="/books">
          一覧へ戻る
        </Link>
      </header>

      {canManageBooks ? (
        <BookForm />
      ) : (
        <section className="status status-error">
          <h2>この画面は管理者だけが利用できます</h2>
          <p>本を登録するには、管理者としてログインした状態でアクセスしてください。</p>
          <p>
            <Link href="/login">ログイン画面へ移動</Link>
          </p>
        </section>
      )}
    </main>
  );
}
