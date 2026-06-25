import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

import { BookForm } from "@/components/BookForm";
import { Card, CardContent } from "@/components/ui/card";
import { fetchCurrentUser } from "@/lib/server-auth";

export default async function NewBookPage() {
  const currentUser = await fetchCurrentUser();

  if (currentUser === null) {
    redirect("/login");
  }

  return (
    <main>
      <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_42%,_#0ea5e9_130%)] px-6 py-7 text-white shadow-[0_32px_100px_-50px_rgba(2,6,23,0.85)] sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              Books
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                本の新規登録
              </h1>
              <p className="max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                必須項目から順に入力できるように情報の優先度を整理し、
                補助説明と状態表示を強化した登録画面です。登録後はそのまま一覧で反映結果を確認できます。
              </p>
            </div>
          </div>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
            href="/books"
          >
            <ArrowLeft className="h-4 w-4" />
            一覧へ戻る
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="border-slate-200 bg-slate-50/80">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Input guide
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                入力の迷いを減らすための整理
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-950">1. 先に必須項目を埋める</p>
                <p>タイトルと著者名を先に入力すると、最低限登録に必要な情報がすぐ揃います。</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-950">2. 任意項目は分かる範囲で補足</p>
                <p>出版年や ISBN は後から探しやすくするための補助情報として扱います。</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-950">3. エラーは入力欄の近くで確認</p>
                <p>どの項目を直すべきかが分かるように、フィールド単位で表示します。</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-900 p-5 text-sm leading-7 text-slate-200">
              <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                この画面で確認したいこと
              </div>
              <p>
                desktop では情報のまとまりが見やすく、mobile では 1
                カラムで入力順が崩れないことを前提に調整しています。
              </p>
            </div>
          </CardContent>
        </Card>

        <BookForm />
      </section>
    </main>
  );
}
