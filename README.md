# 図書管理システム

Next.js、FastAPI、PostgreSQLを使って構築する、初心者向けの図書管理Webアプリケーションです。

このプロジェクトの目的は、フロントエンド、バックエンド、データベースが連携するWebアプリ開発の全体像を学ぶことです。最初は本のCRUD（登録・取得・更新・削除）に対象を絞り、小さな単位で実装します。

## 1. 開発方針

- AI駆動で開発し、本READMEを実装仕様の基準とする
- 機能は小さく追加する
- 1機能ごとに動作確認してコミットする
- 初心者が処理の流れを追える構成を優先する
- 必要になるまで複雑な抽象化や機能を追加しない

### 今回の対象

- 本の一覧表示
- 本の新規登録
- 本の編集
- 本の削除
- 入力値の検証
- 基本的なエラー表示
- 初期管理者1名を作成するための認証準備
- Docker Compose による `frontend` `backend` `db` の統合起動
- GitHub Actions による backend / frontend / E2E の CI 自動確認

### 今回の対象外

- ログイン、ログアウト、認可
- 貸出・返却管理
- 蔵書数・在庫管理
- 著者や出版社の別テーブル化
- 検索、並び替え、ページネーション
- 画像アップロード
- 本番環境へのデプロイ

対象外の機能は、明示的に仕様を追加するまで実装しません。

## 2. テスト方針

- バックエンドAPIは `pytest` とFastAPIの `TestClient` で自動テストする
- 画面を含む挙動確認はPlaywrightで自動テストする
- Playwrightのエビデンスは `test/evidence` 配下へ保存する
- ローカル開発ではNext.jsの `3000` 番、Playwright確認ではNext.jsの `3011` 番からFastAPIへのCORS通信を許可する
- GitHub Actions では backend 用に `ruff check` `ruff format --check` `pytest` を自動実行する
- GitHub Actions では frontend 用に `npm run lint` `npm run build` を自動実行する
- GitHub Actions では Docker Compose 上で Playwright の smoke / env-migration / connectivity / CRUD を自動実行する
- ローカル確認は実装中の切り分けと再現を担当し、CI確認は push / pull_request ごとの継続的な再確認を担当する

## 3. システム全体構成

```mermaid
flowchart LR
    Browser["ブラウザ"]
    Frontend["Next.js<br>フロントエンド"]
    Backend["FastAPI<br>バックエンド"]
    Database[("PostgreSQL<br>データベース")]

    Browser -->|"画面操作"| Frontend
    Frontend -->|"HTTP / REST API / JSON"| Backend
    Backend -->|"SQLAlchemy"| Database
    Database -->|"取得結果"| Backend
    Backend -->|"JSONレスポンス"| Frontend
    Frontend -->|"画面表示"| Browser
```

| 層 | 技術 | 主な役割 |
| --- | --- | --- |
| フロントエンド | Next.js + TypeScript | 画面表示、フォーム入力、API呼び出し |
| バックエンド | FastAPI | API提供、入力検証、CRUD処理 |
| ORM | SQLAlchemy | PythonオブジェクトとDBテーブルの対応付け |
| マイグレーション | Alembic | DB構造の変更履歴を管理 |
| データベース | PostgreSQL | 本の情報を永続保存 |
| CI | GitHub Actions | backend / frontend / Docker Compose E2E の継続的確認 |

役割を分けることで、画面から送られたデータがAPIを通り、DBへ保存されるまでの流れを段階的に学べます。

## 4. 画面一覧

| URL | 画面名 | 主な機能 |
| --- | --- | --- |
| `/books` | 本の一覧画面 | 一覧表示、編集画面への移動、削除 |
| `/books/new` | 本の新規登録画面 | 入力フォームから本を登録 |
| `/books/[id]/edit` | 本の編集画面 | 登録済みの本を取得して更新 |

トップページ `/` は `/books` へ誘導またはリダイレクトします。

削除専用画面は作りません。一覧画面の削除ボタンを押した際に確認し、承認された場合だけ削除します。

### 共通フォーム項目

| 項目 | 必須 | 入力ルール |
| --- | --- | --- |
| タイトル | 必須 | 1文字以上、255文字以内 |
| 著者名 | 必須 | 1文字以上、255文字以内 |
| 出版年 | 任意 | 1以上の整数 |
| ISBN | 任意 | 20文字以内 |

タイトルと著者名は、空白だけの入力を許可しません。

## 5. API一覧

本APIはREST APIとし、リクエストとレスポンスはJSON形式です。

| メソッド | URL | 用途 | 成功時 |
| --- | --- | --- | --- |
| `GET` | `/health` | フロントエンドとAPIの疎通確認 | `200 OK` |
| `GET` | `/api/books` | 本の一覧取得 | `200 OK` |
| `GET` | `/api/books/{id}` | 本を1件取得 | `200 OK` |
| `POST` | `/api/books` | 本の新規登録 | `201 Created` |
| `PUT` | `/api/books/{id}` | 本の更新 | `200 OK` |
| `DELETE` | `/api/books/{id}` | 本の削除 | `204 No Content` |
| `POST` | `/api/admin/bootstrap` | 初期管理者を1回だけ作成 | `201 Created` |

### 本の登録・更新リクエスト

```json
{
  "title": "Webアプリ開発入門",
  "author": "山田太郎",
  "published_year": 2026,
  "isbn": "9780000000000"
}
```

### 本のレスポンス

```json
{
  "id": 1,
  "title": "Webアプリ開発入門",
  "author": "山田太郎",
  "published_year": 2026,
  "isbn": "9780000000000",
  "created_at": "2026-06-15T12:00:00Z",
  "updated_at": "2026-06-15T12:00:00Z"
}
```

一覧取得では、本のレスポンスを配列で返します。初期段階ではページネーション用のラッパーを設けません。

### エラーレスポンス

| ステータス | 発生条件 |
| --- | --- |
| `404 Not Found` | 指定したIDの本が存在しない |
| `409 Conflict` | 同じISBNがすでに登録されている |
| `422 Unprocessable Entity` | 入力値が仕様を満たしていない |
| `500 Internal Server Error` | 想定外のサーバーエラー |

FastAPIの標準的なエラー形式を基本とし、フロントエンドでは利用者が理解できる日本語メッセージを表示します。

### 初期管理者作成API

初期管理者作成APIは、まだ利用者が1件も存在しない状態でだけ実行できます。1件でも利用者が登録された後は `409 Conflict` を返し、再実行できません。

```json
{
  "email": "admin@example.com",
  "username": "admin",
  "password": "AdminPass123"
}
```

レスポンスには `password_hash` を含めません。パスワードは backend 内で `scrypt` を使ってハッシュ化してから保存します。

## 6. DBテーブル設計

本システムでは、業務データとしての `books` と、認証準備用の `users` を分けて管理します。`books` は図書情報、`users` は利用者情報とパスワードハッシュを保持します。

### books

| カラム | PostgreSQL型 | 制約 | 説明 |
| --- | --- | --- | --- |
| `id` | `INTEGER` | PRIMARY KEY、自動採番 | 本の識別子 |
| `title` | `VARCHAR(255)` | NOT NULL | タイトル |
| `author` | `VARCHAR(255)` | NOT NULL | 著者名 |
| `published_year` | `INTEGER` | NULL可、1以上 | 出版年 |
| `isbn` | `VARCHAR(20)` | NULL可、UNIQUE | ISBN |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | 登録日時 |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | 更新日時 |

`created_at` と `updated_at` はバックエンドで設定し、API利用者からは受け取りません。日時はUTCで保存・返却します。

ISBNが未入力の場合は、空文字ではなく `NULL` として保存します。これにより、ISBN未入力の本を複数登録できます。

### users

| カラム | PostgreSQL型 | 制約 | 説明 |
| --- | --- | --- | --- |
| `id` | `INTEGER` | PRIMARY KEY、自動採番 | 利用者の識別子 |
| `email` | `VARCHAR(255)` | NOT NULL、UNIQUE | ログイン候補となるメールアドレス |
| `username` | `VARCHAR(50)` | NOT NULL、UNIQUE | 画面表示やログイン候補に使う名前 |
| `password_hash` | `VARCHAR(255)` | NOT NULL | ハッシュ化したパスワード |
| `role` | `VARCHAR(20)` | NOT NULL | 利用者ロール。Step 24時点では `admin` のみ |
| `is_active` | `BOOLEAN` | NOT NULL | 利用可否 |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | 作成日時 |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | 更新日時 |

Step 24 ではログイン機能までは追加しません。まず `users` テーブルとパスワードハッシュ保存の基盤だけを用意し、Step 25 以降でログインAPIと認可へ進みます。

## 7. フォルダ構成

```text
Library/
├── frontend/
│   ├── app/
│   │   ├── books/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── BookForm.tsx
│   ├── e2e/
│   │   ├── admin-bootstrap-api.spec.ts
│   │   ├── books-crud.spec.ts
│   │   ├── docker-compose-books-crud.spec.ts
│   │   ├── docker-compose-connectivity.spec.ts
│   │   ├── docker-compose-env-migration.spec.ts
│   │   ├── docker-compose-smoke.spec.ts
│   │   └── support/
│   │       └── evidence.ts
│   ├── lib/
│   │   └── api.ts
│   ├── scripts/
│   │   └── run-e2e.ps1
│   ├── types/
│   │   └── book.ts
│   ├── .dockerignore
│   ├── .env.local.example
│   ├── Dockerfile
│   ├── playwright.config.ts
│   └── package.json
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── e2e-ci.yml
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   └── book.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   └── book.py
│   │   │   └── user.py
│   │   ├── routers/
│   │   │   ├── admin.py
│   │   │   └── books.py
│   │   ├── services/
│   │   │   └── book.py
│   │   │   └── security.py
│   │   │   └── user.py
│   │   └── repositories/
│   │       ├── book.py
│   │       └── user.py
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_books_api.py
│   │   └── test_users_api.py
│   ├── alembic/
│   ├── .dockerignore
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── .env.example
│   └── requirements.txt
├── .gitignore
├── AGENTS.md
├── ELPLANATION/
│   └── EXPLANATION_STEP0.md
├── test/
│   └── evidence/
├── LEARNING_PROGRESS.md
├── LEARNING_ROADMAP.md
└── README.md
```

### バックエンドの責務

- `models`: SQLAlchemyによるDBテーブル定義
- `schemas`: PydanticによるAPIの入力・出力定義
- `routers`: URL、HTTPメソッド、ステータスコードの定義
- `services`: APIで必要な業務ルール、存在確認、重複確認、例外変換前の判断
- `repositories`: DBの登録・取得・更新・削除処理
- `tests`: FastAPIのAPIテストとテスト用DB設定
- `database.py`: DB接続とセッション管理
- `main.py`: FastAPIアプリの生成とルーター登録

### フロントエンドの責務

- `app`: URLに対応する画面
- `components`: 複数画面で使うUI部品
- `e2e`: Playwrightによる画面操作テスト
- `e2e/support/evidence.ts`: Playwright証跡の保存先切り替え
- `lib/api.ts`: FastAPIとの通信処理
- `scripts`: フロントエンド関連の補助スクリプト
- `types`: APIで扱うデータのTypeScript型

### CIの責務

- `backend-ci.yml`: Python依存関係を入れ、`ruff` と `pytest` で backend の品質を確認する
- `frontend-ci.yml`: Node.js依存関係を入れ、`npm run lint` と `npm run build` で frontend の品質を確認する
- `e2e-ci.yml`: Docker Compose で 3 サービスを起動し、Playwright でアプリ全体の疎通と CRUD を確認する

## 7. 環境変数

接続情報や環境ごとに変わるURLは、ソースコードに直接書かず環境変数で管理します。

### バックエンド

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/library
```

Compose 運用でも backend 起動と Alembic migration の両方で `DATABASE_URL` を使う方針とする。

`DATABASE_URL` は FastAPI本体とAlembicが共通で利用する接続文字列です。
ローカル直接実行では `localhost` を使います。
backend を単体Dockerコンテナで起動し、ホストOS上の PostgreSQL へ接続する場合は、Windows / macOS では `host.docker.internal` を使う前提とします。
`docker-compose.yml` で backend から db へ接続する場合は、DBホストに Compose のサービス名 `db` を使う前提とします。

### フロントエンド

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
INTERNAL_API_BASE_URL=http://backend:8000
```

Compose 運用でも `NEXT_PUBLIC_API_BASE_URL` と `INTERNAL_API_BASE_URL` をそのまま使い、ブラウザ向け公開URLと Next.js server-side fetch 用内部URLを分離する方針とする。

`NEXT_PUBLIC_API_BASE_URL` はブラウザが参照するAPIの公開URLです。
ただし、この値を読む `fetchBooks()` などはNext.jsのサーバー実行でも使われるため、frontend を単体Dockerコンテナで起動する場合に `http://localhost:8000` を入れると、frontend コンテナ自身の `localhost` を見に行ってしまいます。
そのため、frontend コンテナからホストOS上の backend へ接続する場合は、Windows / macOS では `http://host.docker.internal:8000` を使う前提とします。
`INTERNAL_API_BASE_URL` は Next.js サーバー実行時に使う内部通信用URLです。
`docker-compose.yml` では、ブラウザから見える公開URLとして `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` を使い、frontend コンテナから backend コンテナへ接続する内部URLとして `INTERNAL_API_BASE_URL=http://backend:8000` を使う前提とします。
そのため、ブラウザから名前解決できないコンテナ名を `NEXT_PUBLIC_API_BASE_URL` へ直接入れない方針とします。

実際の `.env` と `.env.local` はGit管理しません。代わりに、値の例を記載した `.env.example` と `.env.local.example` を管理します。

## 8. 実装ルール

- APIはREST形式にする
- フロントエンドとバックエンドで項目名を統一する
- DBアクセスはバックエンドからのみ行う
- APIの入力値はPydanticで検証する
- DB構造の変更にはAlembicを使う
- 同じ登録・編集フォームは、可能な範囲で `BookForm` として共通化する
- エラーを握りつぶさず、画面またはログで確認できるようにする
- READMEと実装が異なる場合は、実装前にREADMEを更新する
- 仕様にない機能を独断で追加しない

## 9. 機能の完了基準

各機能は、次の条件をすべて満たした時点で完了とします。

- READMEの仕様を満たしている
- 正常系を手動または自動テストで確認している
- 代表的な異常系を確認している
- 関係のない変更を含んでいない
- 必要に応じてREADMEを更新している
- 1機能単位でコミットできる状態になっている
## 10. Docker・CI関連ファイルと確認方針

Docker と CI の仕様を読むときは、次のファイルを基準にする。

- `docker-compose.yml`: `frontend` `backend` `db` を同時に起動する構成
- `frontend/Dockerfile`: frontend コンテナのビルド定義
- `backend/Dockerfile`: backend コンテナのビルド定義
- `.github/workflows/backend-ci.yml`: backend の lint / format / pytest を自動実行する workflow
- `.github/workflows/frontend-ci.yml`: frontend の lint / build を自動実行する workflow
- `.github/workflows/e2e-ci.yml`: Docker Compose 起動、待機、Playwright、artifact 保存、停止処理を自動実行する workflow
- `frontend/e2e/books-crud.spec.ts`: ローカル起動向けの CRUD E2E
- `frontend/e2e/admin-bootstrap-api.spec.ts`: 初期管理者作成APIの Playwright API テスト
- `frontend/e2e/docker-compose-smoke.spec.ts`: Docker Compose 起動確認
- `frontend/e2e/docker-compose-env-migration.spec.ts`: Compose 環境変数と migration 適用確認
- `frontend/e2e/docker-compose-connectivity.spec.ts`: browser から `frontend` `backend` を通す疎通確認
- `frontend/e2e/docker-compose-books-crud.spec.ts`: Docker Compose 上での CRUD E2E
- `frontend/e2e/support/evidence.ts`: Playwright 証跡保存先の切り替え helper
- `test/evidence/step17-playwright`: Docker Compose 上のローカル CRUD E2E 証跡
- `test/evidence/step21-playwright`: CI 相当の Compose E2E 証跡
- `ELPLANATION/EXPLANATION_STEP11.md` から `ELPLANATION/EXPLANATION_STEP22.md`: Docker と CI の各段階の説明

Docker 運用では、ブラウザ公開用の `NEXT_PUBLIC_API_BASE_URL` と、Next.js サーバー実行用の `INTERNAL_API_BASE_URL` を分ける。Docker Compose 上の画面確認は `frontend/e2e/docker-compose-books-crud.spec.ts` を正本の E2E とし、UI、Next.js routing、FastAPI、PostgreSQL をまとめて確認する。

CI 運用では、backend CI が Python 側の静的確認と API テスト、frontend CI が Next.js 側の lint / build、Docker Compose E2E CI が複数サービスを起動した状態での結合確認を担当する。ローカル確認では失敗の再現と修正中の切り分けを優先し、GitHub Actions では push / pull_request ごとに同じ観点を継続的に再確認する。
