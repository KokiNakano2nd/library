# 図書管理システム 学習進捗管理表

## このドキュメントの目的

本ドキュメントは、`LEARNING_ROADMAP.md` に沿った実装と学習の進捗を記録するための管理表です。

- システム仕様のSSoT: `README.md`
- 学習順序と完了条件: `LEARNING_ROADMAP.md`
- 学習進捗と振り返り: 本ドキュメント

各Stepを開始・完了したときに本ドキュメントを更新します。

## ステータス

| ステータス | 意味 |
| --- | --- |
| 未着手 | まだ学習・実装を始めていない |
| 学習中 | 説明や関連技術を確認している |
| 実装中 | コードを実装している |
| 確認中 | 動作確認や理解度確認を行っている |
| 完了 | 完了条件を満たし、内容を説明できる |
| 保留 | 問題や前提不足により一時停止している |

## 理解度

| レベル | 判断基準 |
| --- | --- |
| 1 | 用語や処理の意味がまだ分からない |
| 2 | 説明を見ながら処理を追える |
| 3 | 処理の流れを自分の言葉で説明できる |
| 4 | 資料を見ながら自分で再実装できる |
| 5 | 資料なしで実装し、問題を切り分けられる |

完了の目安は理解度3以上です。理解度が3未満の場合は、動作していても復習対象とします。

## 全体進捗

| Step | 学習内容 | ステータス | 理解度 | 開始日 | 完了日 | コミット |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Next.jsとFastAPIの疎通確認 | 完了 | 3 | 2026-06-15 | 2026-06-16 | 未作成（.git未検出） |
| 1 | PostgreSQLとの接続 | 完了 | 3 | 2026-06-16 | 2026-06-16 | 未作成（.git未検出） |
| 2 | booksテーブルの作成 | 完了 | 3 | 2026-06-16 | 2026-06-16 | 未作成（.git未検出） |
| 3 | 本の新規登録API | 完了 | 3 | 2026-06-16 | 2026-06-16 | 未作成（.git未検出） |
| 4 | 本の一覧取得API | 完了 | 3 | 2026-06-16 | 2026-06-16 | 未作成（.git未検出） |
| 5 | 本の一覧画面 | 完了 | 3 | 2026-06-21 | 2026-06-21 | 未作成（.git未検出） |
| 6 | 本の新規登録画面 | 完了 | 3 | 2026-06-21 | 2026-06-21 | 未作成（.git未検出） |
| 7-A | 本の1件取得 | 完了 | 3 | 2026-06-21 | 2026-06-21 | 未作成（.git未検出） |
| 7-B | 本の更新 | 完了 | 3 | 2026-06-21 | 2026-06-21 | 未作成（.git未検出） |
| 8-A | 本の削除API | 完了 | 3 | 2026-06-21 | 2026-06-21 | 未作成（.git未検出） |
| 8-B | 一覧画面からの削除 | 完了 | 3 | 2026-06-21 | 2026-06-21 | 未作成（.git未検出） |
| 9 | APIテスト | 完了 | 3 | 2026-06-22 | 2026-06-22 | 未作成（.git未検出） |
| 10 | 全体の振り返り | 未着手 | - | - | - | - |
| 11 | Docker化の前提整理 | 完了 | 3 | 2026-06-22 | 2026-06-22 | 未作成（.git未検出） |
| 12 | backend のコンテナ化 | 完了 | 3 | 2026-06-22 | 2026-06-22 | 未作成（.git未検出） |
| 13 | frontend のコンテナ化 | 完了 | 3 | 2026-06-22 | 2026-06-22 | 未作成（.git未検出） |
| 14 | Docker Compose で 3 サービスをまとめる | 完了 | 3 | 2026-06-22 | 2026-06-22 | 未作成（.git未検出） |
| 15 | 環境変数と migration 運用の整理 | 完了 | 3 | 2026-06-22 | 2026-06-22 | 未作成（.git未検出） |
| 16 | Docker上での疎通確認 | 完了 | 3 | 2026-06-23 | 2026-06-23 | 未作成（.git未検出） |
| 17 | Playwright による Docker 環境の E2E 確認 | 完了 | 3 | 2026-06-23 | 2026-06-23 | 未作成（.git未検出） |
| 18 | Docker化内容のドキュメント反映 | 完了 | 3 | 2026-06-23 | 2026-06-23 | 未作成（.git未検出） |
| 19 | backend の CI 導入 | 完了 | 3 | 2026-06-23 | 2026-06-24 | 未作成（.git未検出） |
| 20 | frontend の CI 導入 | 完了 | 3 | 2026-06-24 | 2026-06-24 | 未作成（.git未検出） |
| 21 | Docker Compose と Playwright を使う CI 導入 | 完了 | 3 | 2026-06-24 | 2026-06-24 | 未作成（.git未検出） |
| 22 | CI 運用内容のドキュメント反映 | 完了 | 3 | 2026-06-24 | 2026-06-24 | 未作成（.git未検出） |
| 23 | GitHub への初回アップロード手順整理 | 完了 | 3 | 2026-06-23 | 2026-06-23 | 未作成（.git未検出） |
| 24 | users テーブルとパスワード管理基盤 | 完了 | 3 | 2026-06-24 | 2026-06-24 | 未作成（.git未検出） |
| 25 | ログイン API と認証状態管理 | 完了 | 3 | 2026-06-24 | 2026-06-24 | 未作成（.git未検出） |
| 26 | 認可と認証必須 API 化 | 完了 | 3 | 2026-06-24 | 2026-06-24 | 未作成（.git未検出） |
| 27 | ログイン画面 | 完了 | 3 | 2026-06-24 | 2026-06-24 | 未作成（.git未検出） |
| 28 | 監査ログ | 完了 | 3 | 2026-06-25 | 2026-06-25 | 未作成（.git未検出） |
| 29 | 構造化ログと例外ハンドリング統一 | 完了 | 3 | 2026-06-25 | 2026-06-25 | 未作成（.git未検出） |
| 30 | shadcn/ui で図書一覧画面と削除確認 UI を改善 | 完了 | 3 | 2026-06-25 | 2026-06-25 | 未作成（.git未検出） |

## 現在の学習状況

| 項目 | 内容 |
| --- | --- |
| 現在のStep | Step 30完了 |
| 次に行うこと | Step 10 の全体振り返りを行い、ここまでのデータフローとエラー切り分けを説明できる状態にする |
| 現在の課題 | 実装自体は一巡したため、CRUD、認証、認可、監査ログ、構造化ログ、UI 改善を通した全体説明と運用観点の整理が必要 |
| 補足で対応したこと | Step 30 で `shadcn/ui` ベースの `Table` と `Dialog` を導入し、図書一覧画面と削除確認 UI を改善した。加えて issue16 で図書登録画面の UX/UI を改善し、`ELPLANATION/EXPLANATION_ISSUE16.md` に記録した |
| 最終更新日 | 2026-06-25 |

## Step別記録

### Step 0: Next.jsとFastAPIの疎通確認

- [x] Next.jsの画面を表示できる
- [x] FastAPIのSwagger UIを表示できる
- [x] `GET /health` がJSONを返す
- [x] Next.jsから `/health` を呼び出せる
- [x] 画面にAPI接続結果が表示される
- [x] Networkタブで通信内容を確認した
- [x] HTTP通信の流れを説明できる

メモ:

> ユーザー判断によりStep 0は完了。FastAPIの単体確認、CORS、Next.jsのlint・本番ビルド、両サーバーを起動した実通信を確認済み。

### Step 1: PostgreSQLとの接続

- [x] 開発用データベースを作成した
- [x] 接続情報を環境変数へ設定した
- [x] SQLAlchemyの接続設定を作成した
- [x] DBセッション管理を作成した
- [x] Alembicを初期設定した
- [x] FastAPIからPostgreSQLへ接続できる
- [x] ORMとマイグレーションの役割を説明できる

メモ:

> PostgreSQL 17をインストールし、`library` データベースを作成。`backend/.env` に接続文字列を設定し、`check_database_connection()` と `alembic current` で接続を確認済み。プロジェクト直下からも `app.database` をimportできるように `backend/setup.py` を追加し、editable install済み。

### Step 2: booksテーブルの作成

- [x] `Book` モデルを作成した
- [x] マイグレーションを生成した
- [x] 生成されたSQL相当の変更を確認した
- [x] マイグレーションを適用した
- [x] `books` テーブルと制約を確認した
- [x] マイグレーションを取り消して再適用した
- [x] モデルとテーブルの関係を説明できる

メモ:

> READMEのDB設計どおりに `books` テーブルを作成。`isbn` のUNIQUE制約、`published_year` の1以上チェック、NOT NULL、日時カラムを確認済み。

### Step 3: 本の新規登録API

- [x] 登録用Pydanticスキーマを作成した
- [x] DB登録処理を作成した
- [x] `POST /api/books` を作成した
- [x] HTTP経由で本を登録できる
- [x] 不正な入力で `422` を確認した
- [x] ISBN重複で `409` を確認した
- [x] JSONがDBへ保存される流れを説明できる

メモ:

> `BookCreate` と `BookResponse` を作成し、router/service/repositoryに分けて `POST /api/books` を実装。`uvicorn` を一時起動してHTTP経由で `201`、`422`、`409`、ISBN未入力の複数登録を確認済み。確認用データは削除した。

### Step 4: 本の一覧取得API

- [x] レスポンス用Pydanticスキーマを作成した
- [x] DB一覧取得処理を作成した
- [x] `GET /api/books` を作成した
- [x] 登録済みの本がJSON配列で返る
- [x] 0件の場合に空配列が返る
- [x] DBデータがJSONへ変換される流れを説明できる

メモ:

> 既存の `BookResponse` を再利用し、repository/service/routerに分けて `GET /api/books` を実装。仮想環境のPythonで構文チェックを行い、一時起動したFastAPIへHTTP経由で0件時の空配列と、登録後にJSON配列へ含まれることを確認済み。確認用データは削除した。

### Step 5: 本の一覧画面

- [x] TypeScriptの `Book` 型を作成した
- [x] API通信処理を作成した
- [x] `/books` に本の一覧を表示した
- [x] 0件時の案内を表示した
- [x] 通信中の表示を用意した
- [x] APIエラーを画面へ表示した
- [x] DBから画面までの流れを説明できる

メモ:

> `frontend/types/book.ts` に `Book` 型を作成し、`frontend/lib/api.ts` に `fetchBooks()` を分離した。`/books` で一覧、0件時、APIエラー時を表示し、`/books/loading.tsx` で通信中表示を用意した。`/` は `/books` へリダイレクトする。`npm run lint` と `npm run build` は成功済み。

### Step 6: 本の新規登録画面

- [x] `/books/new` を作成した
- [x] `BookForm` を作成した
- [x] フォームから登録APIを呼び出せる
- [x] 送信中の二重送信を防止した
- [x] 入力エラーを表示した
- [x] 登録後に一覧画面へ移動した
- [x] フォーム入力からDB登録までの流れを説明できる

メモ:

> `frontend/types/book.ts` に `BookInput` 型を追加し、`frontend/lib/api.ts` に `createBook()` を追加した。`frontend/components/BookForm.tsx` で入力状態、送信処理、送信中の二重送信防止、入力エラー表示を実装し、`/books/new` から利用する。一覧画面には `/books/new` への導線を追加した。`npm run lint` と `npm run build` は成功済み。

### Step 7-A: 本の1件取得

- [x] IDによるDB取得処理を作成した
- [x] `GET /api/books/{id}` を作成した
- [x] 存在しないIDで `404` を確認した
- [x] `/books/[id]/edit` を作成した
- [x] 編集フォームに既存値を表示した
- [x] パスパラメーターと動的ルートを説明できる

メモ:

> `backend/app/repositories/book.py` に `get_book_by_id()` を追加し、service層で存在しないIDを `BookNotFoundError` として扱うようにした。routerでは `GET /api/books/{book_id}` を追加し、存在しないIDを `404` に変換する。frontendでは `fetchBook()` と `/books/[id]/edit` を追加し、URLのIDから本を取得して既存値をフォームへ表示する。

### Step 7-B: 本の更新

- [x] DB更新処理を作成した
- [x] `PUT /api/books/{id}` を作成した
- [x] `BookForm` を登録・編集で共通利用した
- [x] 編集画面から本を更新できる
- [x] 更新後に一覧画面へ移動した
- [x] 存在しないIDとISBN重複を確認した
- [x] INSERTとUPDATEの違いを説明できる

メモ:

> `BookUpdate`、`update_book()`、`PUT /api/books/{book_id}` を追加した。更新時は対象ID以外のISBN重複を確認し、重複時は `409` を返す。`BookForm` は初期値、送信処理、ボタン文言をprops化し、新規登録と編集で共通利用できるようにした。更新成功後は `/books` へ移動する。

### Step 8-A: 本の削除API

- [x] DB削除処理を作成した
- [x] `DELETE /api/books/{id}` を作成した
- [x] HTTP経由で本を削除できる
- [x] 成功時に `204` が返る
- [x] 存在しないIDで `404` を確認した
- [x] `204 No Content` の意味を説明できる

メモ:

> repository層に `delete_book()`、service層に存在確認付きの `delete_book()`、router層に `DELETE /api/books/{book_id}` を追加した。成功時はレスポンス本文を返さない `204 No Content` とし、存在しないIDは既存の `BookNotFoundError` を使って `404 Not Found` に変換する。

### Step 8-B: 一覧画面からの削除

- [x] 一覧画面に削除ボタンを追加した
- [x] 削除前に確認を表示した
- [x] キャンセル時に削除されない
- [x] 削除後に一覧を更新した
- [x] 削除失敗時にエラーを表示した
- [x] API結果と画面状態の関係を説明できる

メモ:

> `frontend/lib/api.ts` に `deleteBook()` を追加し、一覧表示部分を `BooksList` Client Componentへ分離した。削除前に `window.confirm()` で確認し、キャンセル時はAPIを呼ばない。削除成功時はReact stateから対象の本を除外し、失敗時は一覧上部にエラーを表示する。

### Step 9: APIテスト

- [x] テスト環境を準備した
- [x] 登録APIをテストした
- [x] 一覧・1件取得APIをテストした
- [x] 更新APIをテストした
- [x] 削除APIをテストした
- [x] `404`、`409`、`422` をテストした
- [x] テストを繰り返しても結果が安定している
- [x] テストの実行方法を `ELPLANATION/EXPLANATION_STEP9.md` へ記載した

メモ:

> `pytest` とFastAPIの `TestClient` を使い、SQLiteのインメモリDBへ依存を差し替えるAPIテストを追加した。CRUD正常系、存在しないIDの `404`、不正入力の `422`、ISBN重複の `409` を確認済み。追加でPlaywright E2Eテストを作成し、画面から登録、編集、削除できることを確認した。`.\.venv\Scripts\python.exe -m pytest` は4件成功、`npm run test:e2e` は1件成功した。

### Step 10: 全体の振り返り

- [ ] 画面からCRUDを一通り実行した
- [ ] Networkタブで各HTTP通信を確認した
- [ ] Swagger UIから各APIを操作した
- [ ] PostgreSQLで保存結果を確認した
- [ ] 各技術とファイルの責務を説明した
- [ ] エラーが発生した層を切り分けた
- [ ] READMEと実装の一致を確認した
- [ ] CRUD全体のデータフローを説明できる

メモ:

> 未記入

### Step 11: Docker化の前提整理

- [x] `backend/requirements.txt` の依存関係を確認した
- [x] backend と frontend の起動コマンドを整理した
- [x] `DATABASE_URL` と `NEXT_PUBLIC_API_BASE_URL` の役割を整理した
- [x] `.env` と Compose の環境変数注入の役割分担を整理した
- [x] Docker化で混乱しやすい URL の見え方の違いを整理した

メモ:

> `httpx2` は Docker build を止める誤った依存名だったため修正した。Docker 化そのものはまだ行わず、Step 12以降で Dockerfile と Compose を追加する。

### Step 12: backend のコンテナ化

- [x] `backend/Dockerfile` を作成した
- [x] Python のベースイメージを決定した
- [x] `requirements.txt` を使って依存関係を install できるようにした
- [x] `uvicorn` を `0.0.0.0:8000` で待ち受けるようにした
- [x] コンテナ内で Alembic を実行できる状態を整えた
- [x] backend イメージを build した
- [x] backend コンテナを `8000` 番ポートで起動した
- [x] `/health` へ疎通できることを確認した

メモ:

> backend 単体コンテナからホスト側 PostgreSQL を使う場合、`localhost` ではなく `host.docker.internal` を `DATABASE_URL` のホスト名へ入れる必要がある。

### Step 13: frontend のコンテナ化

- [x] `frontend/Dockerfile` を作成した
- [x] Node.js のベースイメージを決定した
- [x] `package-lock.json` を使って依存関係を install できるようにした
- [x] `next dev --hostname 0.0.0.0 --port 3000` で起動できるようにした
- [x] ブラウザから利用する API URL の扱いを整理した
- [x] frontend イメージを build した
- [x] frontend コンテナを `3000` 番ポートで起動した
- [x] Playwright で `/books` 画面へ到達できることを確認した

メモ:

> Next.js の `fetch` はブラウザ実行だけでなくサーバー実行でも使われるため、frontend を単体コンテナで起動する場合の `NEXT_PUBLIC_API_BASE_URL` には `localhost` ではなく `host.docker.internal` が必要になる。

## 学習記録

学習を行った日ごとに、以下の形式で追記します。

### 2026-06-15: Step 0

**実施内容**

- FastAPIに `GET /health` とローカル開発用CORSを実装した
- Next.jsにAPI接続結果を表示する画面を実装した
- API単体、Swagger UI、CORS、lint、本番ビルド、実通信を確認した

**理解できたこと**

- フロントエンドからFastAPIへHTTPリクエストを送り、JSONレスポンスを画面へ反映する流れ

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: Reactのlintがtry/catch内のJSX生成を検出した
- 原因: 通信処理と画面生成を同じtry/catch内で行っていた
- 解決方法: 通信処理から結果オブジェクトを返し、JSX生成をtry/catchの外へ分離した

**次回行うこと**

- Step 1としてPostgreSQL接続設定を行う

### 2026-06-16: Step 1

**実施内容**

- `DATABASE_URL` の設定例として `backend/.env.example` を追加した
- SQLAlchemyの接続設定、`Base`、DBセッション管理を `backend/app/database.py` に追加した
- Alembicの初期設定として `backend/alembic.ini`、`backend/alembic/env.py`、`backend/alembic/script.py.mako` を追加した
- STEP1の補足説明を `ELPLANATION/EXPLANATION_STEP1.md` に追加した
- STEP1に必要な依存関係を `backend/requirements.txt` と仮想環境へ追加した
- PostgreSQL 17をインストールし、`library` データベースを作成した
- `backend/.env` に実接続用の `DATABASE_URL` を設定した
- `check_database_connection()` と `alembic current` でPostgreSQL接続を確認した
- プロジェクト直下から `app.database` を読み込めるように `backend/setup.py` を追加し、仮想環境へ editable install した

**理解できたこと**

- DB接続情報はソースコードへ直接書かず、環境変数から読み込む
- SQLAlchemyの `engine` はDB接続の入口、`SessionLocal` はDB操作の単位を作る
- AlembicはSQLAlchemyのモデル情報とDB接続設定を使ってマイグレーションを管理する

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: `pip install` がサンドボックス内のネットワーク制限で失敗した
- 原因: パッケージ取得に外部ネットワーク接続が必要だった
- 解決方法: 承認付きで依存関係をインストールした
- 問題: 最初はPostgreSQL本体、`psql`、PostgreSQLサービスが見つからなかった
- 原因: PostgreSQLが未インストールだった
- 解決方法: PostgreSQL 17を `winget` でインストールした
- 問題: `psql` がPATHに追加されていなかった
- 原因: インストール後の現在のシェルではPATH更新が反映されていなかった
- 解決方法: `C:\Program Files\PostgreSQL\17\bin\psql.exe` を直接指定して確認した
- 問題: プロジェクト直下から `from app.database import ...` を実行すると `ModuleNotFoundError` になった
- 原因: Pythonの探索対象に `backend` ディレクトリが入っていなかった
- 解決方法: `backend/setup.py` を追加し、`library-backend` を editable install した

**次回行うこと**

- Step 2として `books` テーブル用のモデルとマイグレーションを作成する

### YYYY-MM-DD: Step X

**実施内容**

- 

**理解できたこと**

- 

**分からなかったこと**

- 

**発生した問題と解決方法**

- 問題:
- 原因:
- 解決方法:

**次回行うこと**

- 

### 2026-06-16: Step 2

**実施内容**

- SQLAlchemyの `Book` モデルを `backend/app/models/book.py` に作成した
- Alembicがモデルを検出できるように `backend/alembic/env.py` でモデルを読み込んだ
- `books` テーブル作成用マイグレーションを生成した
- `alembic upgrade head` でPostgreSQLへ `books` テーブルを作成した
- `psql` でカラム、主キー、UNIQUE制約、CHECK制約を確認した
- `alembic downgrade base` と `alembic upgrade head` で取り消しと再適用を確認した
- `ELPLANATION/EXPLANATION_STEP2.md` を追加した

**理解できたこと**

- SQLAlchemyモデルはPythonコードでDBテーブル構造を表す
- AlembicはモデルをもとにDB構造変更の履歴ファイルを作る
- `upgrade` で変更を適用し、`downgrade` で取り消せる
- `UNIQUE`、`NOT NULL`、`CHECK` がDB側の制約として作られる

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: なし
- 原因: -
- 解決方法: -

**次回行うこと**

- Step 3として本の新規登録APIを作成する

### 2026-06-16: Step 3

**実施内容**

- 登録用Pydanticスキーマ `BookCreate` を作成した
- レスポンス用Pydanticスキーマ `BookResponse` を作成した
- `backend/app/repositories/book.py` にDB登録処理とISBN検索処理を作成した
- `backend/app/services/book.py` にISBN重複確認、日時設定、登録処理を作成した
- `backend/app/routers/books.py` に `POST /api/books` を作成した
- `backend/app/main.py` にbooksルーターを登録した
- `ELPLANATION/EXPLANATION_STEP3.md` を追加した

**理解できたこと**

- PydanticスキーマはAPIの入力と出力を検証・整形する
- SQLAlchemyモデルはDBテーブルの構造を表す
- routerはHTTPの入口、serviceは業務ルール、repositoryはDBアクセスを担当する
- `201`、`409`、`422` の使い分け
- ISBN未入力は `NULL` として扱うことで複数登録できる

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: 最初のHTTP確認でPostgreSQLに `books` テーブルが無く、登録APIが `500` になった
- 原因: Alembicマイグレーションが現在のDBへ適用されていなかった
- 解決方法: `alembic upgrade head` を実行して `books` テーブルを作成し、再度HTTP確認した

**確認したこと**

- `python -m compileall app` で構文チェックした
- `uvicorn` を一時起動して `POST /api/books` の `201` を確認した
- ISBN重複時に `409` を確認した
- 不正な入力で `422` を確認した
- ISBN未入力の本を複数登録できることを確認した
- 確認用データを削除した

**次回行うこと**

- Step 4として本の一覧取得APIを作成する

### 2026-06-16: Step 4

**実施内容**

- `backend/app/repositories/book.py` に `list_books()` を追加し、`books` テーブルを `id` 昇順で一覧取得するようにした
- `backend/app/services/book.py` に一覧取得用の呼び出し口を追加した
- `backend/app/routers/books.py` に `GET /api/books` を追加した
- 既存の `BookResponse` を一覧レスポンスにも利用した
- `ELPLANATION/EXPLANATION_STEP4.md` を追加した

**理解できたこと**

- 一覧取得ではDBから複数レコードをSELECTし、APIではJSON配列として返す
- 0件はエラーではなく、空配列 `[]` として表現する
- `response_model=list[BookResponse]` により、SQLAlchemyモデルの配列をAPIレスポンス用の形へ変換できる
- routerはHTTPの入口、serviceは処理の呼び出し口、repositoryはDBアクセスを担当する

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: 最初にグローバルPythonで `uvicorn` を起動したため `psycopg` が見つからず起動に失敗した
- 原因: 必要な依存関係は `backend/.venv` に入っていた
- 解決方法: `backend/.venv/Scripts/python.exe` を使って構文チェックとHTTP確認を行った

**確認したこと**

- `backend/.venv` のPythonで `python -m compileall app` を実行し、構文エラーがないことを確認した
- 一時起動したFastAPIで `GET /api/books` が `200 OK` を返すことを確認した
- 本が0件の場合に空配列が返ることを確認した
- `POST /api/books` で確認用データを登録後、`GET /api/books` のJSON配列に含まれることを確認した
- 確認用データを削除した

**次回行うこと**

- Step 6として本の新規登録画面を作成する

### 2026-06-21: Step 5

**実施内容**

- `frontend/types/book.ts` にAPIレスポンス用の `Book` 型を追加した
- `frontend/lib/api.ts` に `GET /api/books` を呼び出す `fetchBooks()` を追加した
- `frontend/app/books/page.tsx` に本の一覧画面を追加した
- 0件時、APIエラー時、通信中の表示を追加した
- `frontend/app/page.tsx` で `/` から `/books` へリダイレクトするようにした
- `ELPLANATION/EXPLANATION_STEP5.md` を追加した

**理解できたこと**

- Next.jsの `app/books/page.tsx` が `/books` の画面になる
- TypeScriptの型を作るとAPIレスポンスの扱いを明確にできる
- API通信処理をUIから分けると、画面側は表示に集中できる
- 0件はエラーではなく、空の一覧として扱う

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: この作業ディレクトリでは `.git` が検出されず、コミットを作成できなかった
- 原因: `git status` が `not a git repository` を返した
- 解決方法: 進捗のコミット欄に `.git未検出` と記録した

**確認したこと**

- `npm run lint` でESLintエラーがないことを確認した
- `npm run build` でNext.jsの本番ビルドが成功することを確認した

**次回行うこと**

- Step 6として本の新規登録画面を作成する

### 2026-06-21: Step 6

**実施内容**

- `frontend/types/book.ts` に登録APIへ送る `BookInput` 型を追加した
- `frontend/lib/api.ts` に `POST /api/books` を呼び出す `createBook()` を追加した
- `frontend/components/BookForm.tsx` に本の新規登録フォームを追加した
- `frontend/app/books/new/page.tsx` に `/books/new` 画面を追加した
- 一覧画面から新規登録画面へ移動できるリンクを追加した
- `ELPLANATION/EXPLANATION_STEP6.md` を追加した

**理解できたこと**

- クライアントコンポーネントでは `useState` でフォーム入力状態を管理できる
- submitイベントで画面遷移を止め、JSONとしてAPIへPOSTできる
- API通信処理を `lib/api.ts` に分けると、フォームは入力と表示に集中できる
- 登録成功後は `router.push("/books")` で一覧画面へ移動できる

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: この作業ディレクトリでは `.git` が検出されず、コミットを作成できなかった
- 原因: `git status` が `not a git repository` を返した
- 解決方法: 進捗のコミット欄に `.git未検出` と記録した
- 問題: `http://127.0.0.1:3000/books/new` から登録すると `APIに接続できませんでした。` が表示された
- 原因: FastAPIのCORS設定が `http://localhost:3000` のみ許可しており、`http://127.0.0.1:3000` からのブラウザ通信が拒否された
- 解決方法: `backend/app/main.py` の `allow_origins` に `http://127.0.0.1:3000` を追加した

**確認したこと**

- `npm run lint` でESLintエラーがないことを確認した
- `npm run build` でNext.jsの本番ビルドが成功することを確認した
- ビルド結果に `/books/new` が含まれることを確認した
- Next.jsを起動し、`/books/new` が `200 OK` を返すことを確認した
- FastAPIを起動し、`/health` と `/api/books` が `200 OK` を返すことを確認した
- `http://127.0.0.1:3000` からのCORSプリフライトが `200 OK` を返し、`access-control-allow-origin` が `http://127.0.0.1:3000` になることを確認した

**次回行うこと**

- Step 8-Aとして本の削除APIを作成する

### 2026-06-21: Step 7

**実施内容**

- `GET /api/books/{id}` を追加した
- `PUT /api/books/{id}` を追加した
- IDによるDB取得処理とDB更新処理をrepository層へ追加した
- 存在しない本を `BookNotFoundError` として扱い、routerで `404 Not Found` に変換した
- 更新時のISBN重複を確認し、重複時は `409 Conflict` を返すようにした
- `frontend/lib/api.ts` に `fetchBook()` と `updateBook()` を追加した
- `BookForm` を登録・編集で共通利用できるようにした
- `/books/[id]/edit` 画面と一覧画面からの編集リンクを追加した
- `ELPLANATION/EXPLANATION_STEP7.md` を追加した

**理解できたこと**

- パスパラメーターのIDを使うと、REST APIで特定の1件を扱える
- 編集画面では、まず既存データを取得してフォームの初期値に設定する必要がある
- INSERTは新しいレコードを作成し、UPDATEは既存レコードの値を変更する
- 更新時のISBN重複確認では、自分自身のISBNは重複扱いにしない

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: ポート8000で動いていたFastAPIが変更前のプロセスで、追加した `GET /api/books/{id}` が `404` になった
- 原因: サーバー再起動前の古いアプリが応答していた
- 解決方法: backendの構文チェック、ルート定義確認、service層の直接確認で変更後のアプリを検証した
- 問題: `fastapi.testclient.TestClient` を使った確認ができなかった
- 原因: この環境では `starlette.testclient` が要求する `httpx2` が未導入だった
- 解決方法: 追加インストールは行わず、DBセッション付きでservice層を直接呼び出して確認した
- 問題: この作業ディレクトリでは `.git` が検出されず、コミットを作成できなかった
- 原因: `git status` が `not a git repository` を返した
- 解決方法: 進捗のコミット欄に `.git未検出` と記録した

**確認したこと**

- `.\.venv\Scripts\python.exe -m compileall app` でPython構文エラーがないことを確認した
- `npm run lint` でESLintエラーがないことを確認した
- `npm run build` でNext.jsの本番ビルドが成功することを確認した
- ビルド結果に `/books/[id]/edit` が含まれることを確認した
- FastAPIのルート定義に `GET /api/books/{book_id}` と `PUT /api/books/{book_id}` が含まれることを確認した
- service層で本の1件取得、更新、存在しないIDの例外を確認した

**次回行うこと**

- Step 8-Aとして本の削除APIを作成する

### 2026-06-21: Step 8

**実施内容**

- repository層に `delete_book()` を追加した
- service層に存在確認付きの `delete_book()` を追加した
- router層に `DELETE /api/books/{book_id}` を追加した
- 削除成功時はレスポンス本文を返さない `204 No Content` にした
- 存在しないIDの削除は `BookNotFoundError` を使って `404 Not Found` に変換した
- `frontend/lib/api.ts` に `deleteBook()` を追加した
- 一覧表示部分を `BooksList` Client Componentに分離した
- 一覧画面に削除ボタン、削除前確認、削除中状態、削除失敗時のエラー表示を追加した
- `ELPLANATION/EXPLANATION_STEP8.md` を追加した

**理解できたこと**

- DELETEメソッドは既存レコードを削除する操作に使う
- `204 No Content` は処理成功を表すが、レスポンス本文を返さない
- `204` のレスポンスではフロントエンド側でJSONを読まない
- 一覧画面の表示更新は、削除成功後にReact stateから対象データを除外して行える
- 削除前確認でキャンセルされた場合はAPIを呼ばない

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: 既存ファイルの日本語文字列がコンソール上で文字化けし、差分適用が不安定だった
- 原因: PowerShell表示上の文字コードとファイル内容の扱いが一致していなかった
- 解決方法: 影響範囲の小さい `backend/app/routers/books.py` と `frontend/lib/api.ts` は、既存構造を保ったまま通常の日本語文字列で書き直した
- 問題: この作業ディレクトリでは `.git` が検出されず、コミットを作成できなかった
- 原因: `git status` が `not a git repository` を返した
- 解決方法: 進捗のコミット欄に `.git未検出` と記録した

**確認したこと**

- `.\.venv\Scripts\python.exe -m compileall app` でPython構文エラーがないことを確認した
- `npm run lint` でESLintエラーがないことを確認した
- `npm run build` でNext.jsの本番ビルドが成功することを確認した
- FastAPIのルート定義に `DELETE /api/books/{book_id}` が含まれることを確認した
- service層で本の作成、削除、削除後の存在しないID扱い、存在しないID削除時の例外を確認した
- FastAPIを一時起動し、実HTTPで削除成功時の `204`、削除後取得時の `404`、存在しないID削除時の `404` を確認した
- HTTP確認用データが残っていないことを確認した

**次回行うこと**

- Step 9としてAPIテストを追加する

### 2026-06-22: Step 9

**実施内容**

- `backend/requirements.txt` に `pytest` と `httpx2` を追加した
- `backend/tests/conftest.py` を追加し、テスト用SQLite DBと `TestClient` を準備した
- FastAPIの `get_db` 依存をテスト用DBへ差し替えるfixtureを作成した
- `backend/tests/test_books_api.py` を追加し、CRUD APIの正常系を自動テスト化した
- 存在しないIDの `404`、不正入力の `422`、ISBN重複の `409` を自動テスト化した
- `@playwright/test` を追加した
- `frontend/playwright.config.ts` を追加した
- `frontend/scripts/run-e2e.ps1` を追加し、FastAPIとNext.jsを起動してからPlaywrightを実行できるようにした
- `frontend/e2e/books-crud.spec.ts` を追加し、画面から本の登録、編集、削除を確認できるようにした
- Playwrightのスクリーンショットを `test/evidence/step9-playwright` に保存した
- Playwright用のNext.js確認ポート `3011` をFastAPIのCORS許可オリジンへ追加した
- `ELPLANATION/EXPLANATION_STEP9.md` を追加した
- `README.md` にテスト方針、Playwright関連のフォルダ構成、エビデンス保存方針を反映した

**理解できたこと**

- `pytest` のfixtureを使うと、各テストの前後で準備と後片付けを共通化できる
- `TestClient` を使うと、FastAPIアプリをHTTPに近い形でテストできる
- `app.dependency_overrides` を使うと、API本体のコードを変えずにDB接続先だけをテスト用へ差し替えられる
- テスト用DBを使うことで、開発用PostgreSQLのデータを汚さずに回帰テストを実行できる
- 正常系だけでなく `404`、`409`、`422` を確認すると、API仕様の壊れを検出しやすくなる
- Playwrightを使うと、実際のブラウザ操作に近い形で画面遷移とAPI通信をまとめて確認できる
- CORSはAPI単体テストでは見つからず、ブラウザを使ったE2Eテストで検出できる場合がある
- エビデンス用スクリーンショットを残すと、どの画面状態まで確認できたかを後から追いやすい

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: `pytest` が仮想環境に入っておらず、最初の確認で `No module named pytest` になった
- 原因: これまで自動テスト用の依存関係を追加していなかった
- 解決方法: `backend/requirements.txt` に `pytest` を追加し、仮想環境へインストールした
- 問題: `httpx` を入れた状態ではStarletteの `TestClient` から非推奨警告が出た
- 原因: 現在のStarletteは `httpx2` を優先して利用する実装になっていた
- 解決方法: `requirements.txt` の依存を `httpx2` に切り替え、警告なしでテストが通ることを確認した
- 問題: Playwrightの初回実行で、画面から登録APIを呼ぶと「APIに接続できませんでした。」になった
- 原因: PlaywrightではNext.jsを `127.0.0.1:3011` で起動するが、FastAPIのCORS許可オリジンに含まれていなかった
- 解決方法: `http://localhost:3011` と `http://127.0.0.1:3011` をCORS許可オリジンへ追加した
- 問題: Playwrightの `webServer` 設定でFastAPIを起動すると、テスト成功後もプロセス終了待ちでコマンドがタイムアウトした
- 原因: Windows上でPlaywrightのwebServer管理とUvicornプロセス終了の相性が悪かった
- 解決方法: `frontend/scripts/run-e2e.ps1` でサーバー起動、待機、Playwright実行、停止を明示的に行う構成にした
- 問題: この作業ディレクトリでは `.git` が検出されず、コミットを作成できなかった
- 原因: `git status` が `not a git repository` を返した
- 解決方法: 進捗のコミット欄に `.git未検出` と記録した

**確認したこと**

- `.\.venv\Scripts\python.exe -m pip install -r requirements.txt` でテスト依存関係をインストールした
- `.\.venv\Scripts\python.exe -m pytest` でAPIテスト4件が成功することを確認した
- `.\.venv\Scripts\python.exe -m compileall app tests` でPython構文エラーがないことを確認した
- `npm install` でPlaywright依存関係をインストールした
- `npx playwright install chromium` でPlaywright用Chromiumをインストールした
- `npm run test:e2e` でPlaywright E2Eテスト1件が成功することを確認した
- `test/evidence/step9-playwright` に4枚のスクリーンショットが保存されることを確認した

**次回行うこと**

- Step 10として全体の振り返りを行う

### 2026-06-22: Step 11

**実施内容**

- `backend/requirements.txt` の依存関係を見直し、`httpx2` を `httpx` へ修正した
- `backend/app/database.py` と `backend/alembic/env.py` を読み、`DATABASE_URL` が backend と Alembic の共通設定であることを整理した
- `frontend/lib/api.ts` を読み、`NEXT_PUBLIC_API_BASE_URL` がブラウザ視点の公開URLであることを整理した
- `README.md` に環境変数の責務を追記した
- `ELPLANATION/EXPLANATION_STEP11.md` を追加し、Docker化前提、起動条件、URLの見え方、確認コマンドを記録した

**理解できたこと**

- Docker 化の前に依存関係ファイルの誤りを消しておくと、build failure の原因を絞り込みやすい
- `DATABASE_URL` は backend 実行と Alembic migration の両方で同じ値を使うべきである
- `NEXT_PUBLIC_` 付きの環境変数はブラウザが利用するため、コンテナ内部のホスト名をそのまま設定してはいけない
- `localhost` は実行している場所ごとに意味が変わるため、ブラウザ視点とコンテナ視点を分けて考える必要がある

**分からなかったこと**

- なし

**発生した問題と解決方法**

- 問題: `backend/requirements.txt` に `httpx2==2.0.0` という依存名が入っており、Docker build 時の `pip install -r requirements.txt` を止める可能性があった
- 原因: 前Stepの記録で `httpx2` を正規の依存名として扱っていた
- 解決方法: 正しい依存名 `httpx==0.28.1` へ修正し、`pytest` を再実行して確認した
- 問題: この作業ディレクトリでは `.git` が検出されず、コミットを作成できなかった
- 原因: `git status` が `not a git repository` を返した
- 解決方法: 進捗のコミット欄には今回も `.git未検出` と記録する前提で進める

**確認したこと**

- `.\.venv\Scripts\python.exe -m pytest` で backend のAPIテストが成功することを確認した
- `.\.venv\Scripts\python.exe -m compileall app tests` で backend の構文エラーがないことを確認した
- `npm run lint` で frontend のESLintエラーがないことを確認した
- `npm run build` で frontend の本番ビルドが成功することを確認した

**次回行うこと**

- Step 12としてbackendのコンテナ化を行う

### 2026-06-22: Step 12

**実施内容**

- `backend/Dockerfile` を追加し、`python:3.13-slim` をベースに依存関係 install と `uvicorn` 起動を定義した
- `backend/.dockerignore` を追加し、`.venv` や `__pycache__` を build context から除外した
- `README.md` を更新し、backend 単体コンテナ実行時の `DATABASE_URL` の考え方を仕様へ反映した
- `docker build -t library-backend-step12 .` で backend イメージを build した
- `docker run` で backend コンテナを起動し、`/health` へ疎通確認した
- `docker run --rm ... alembic current` を実行し、コンテナ内から migration 状態を読めることを確認した
- `ELPLANATION/EXPLANATION_STEP12.md` を追加し、Dockerfile のコードレベル説明と確認コマンドを記録した

**理解できたこと**

- Dockerfile は `COPY requirements.txt` を先に行うと、依存関係が変わらない限り install 層を再利用しやすい
- `uvicorn` を `0.0.0.0` で待ち受けないと、コンテナ外のブラウザや `docker run -p` から到達できない
- Alembic をコンテナ内で使うには、依存関係だけでなく `alembic.ini`、`alembic/`、`app/` をイメージへ含める必要がある
- backend 単体コンテナからホストOS上の PostgreSQL を参照する場合、`localhost` はコンテナ自身を指す

**分からなかったこと**

- なし

**次に調べたいこと / 気づき**

- Linux 環境では `host.docker.internal` の扱いが異なるため、Compose 化のStepで接続先を再整理する

**次回行うこと**

- Step 13としてfrontendのコンテナ化を行う

### 2026-06-22: Step 13

**実施内容**

- `frontend/Dockerfile` を追加し、`node:22-bookworm-slim` をベースに `npm ci` と `next dev` 起動を定義した
- `frontend/.dockerignore` を追加し、`node_modules` や `.next` を build context から除外した
- `frontend/playwright.config.ts` を更新し、`PLAYWRIGHT_BASE_URL` で接続先を切り替えられるようにした
- `README.md` を更新し、frontend 単体コンテナ実行時の `NEXT_PUBLIC_API_BASE_URL` の考え方を仕様へ反映した
- `frontend/e2e/frontend-container-smoke.spec.ts` を追加し、frontend コンテナで `/books` 画面へ到達できることを確認する Playwright テストを用意した
- `docker build -t library-frontend-step13 .` で frontend イメージを build した
- `docker run` で frontend コンテナを起動し、Playwright で `/books` 画面の表示確認と証跡取得を行った
- `ELPLANATION/EXPLANATION_STEP13.md` を追加し、Dockerfile と smoke テストのコードレベル説明、確認コマンド、証跡パスを記録した

**理解できたこと**

- `package-lock.json` を使って `npm ci` を行うと、ローカルとコンテナで依存関係を揃えやすい
- `next dev` をコンテナ外から見せるには `0.0.0.0` で待ち受ける必要がある
- Next.js のサーバーコンポーネント内 `fetch` はコンテナ内で実行されるため、backend 接続先の `localhost` 解釈に注意が必要

**分からなかったこと**

- なし

**次に調べたいこと / 気づき**

- Compose 化では browser 用 URL とコンテナ間通信用 URL をどう分離するかを整理したい

**次回行うこと**

- Step 14としてDocker Composeで3サービスをまとめる

### Step 14: Docker Compose で 3 サービスをまとめる

- [x] `docker-compose.yml` を作成した
- [x] `frontend` `backend` `db` の 3 サービスを定義した
- [x] `ports` `volumes` `environment` を設定した
- [x] PostgreSQL の永続化 volume を定義した
- [x] `db` の healthcheck を設定した
- [x] `docker compose up` で 3 サービスをまとめて起動した
- [x] frontend から `/books` 画面へ到達できることを確認した

メモ:

> Compose化では、ブラウザ向けの `NEXT_PUBLIC_API_BASE_URL` と、frontend コンテナから backend へ接続する `INTERNAL_API_BASE_URL` を分けないと、server-side fetch と client-side fetch のどちらかが壊れる。

### 2026-06-22: Step 14

**実施内容**

- `docker-compose.yml` を追加し、`frontend` `backend` `db` の 3 サービス、named volume、`db` healthcheck を定義した
- `frontend/lib/api.ts` を更新し、ブラウザ用の `NEXT_PUBLIC_API_BASE_URL` と内部通信用の `INTERNAL_API_BASE_URL` を切り替えられるようにした
- `backend` サービスの起動コマンドで `alembic upgrade head` を先に実行し、空の Compose 用DBでも books テーブルを作成できるようにした
- `frontend/e2e/docker-compose-smoke.spec.ts` を追加し、Compose 起動後に `/books` 画面へ到達できることを確認する Playwright テストを用意した
- `README.md` を更新し、Compose 利用時の `DATABASE_URL` と 2種類の API URL の役割を仕様へ反映した
- `docker compose up -d --build` で 3 サービスを起動した
- `Invoke-WebRequest http://127.0.0.1:8000/health` で backend 疎通を確認した
- Playwright で `http://127.0.0.1:3000/books` の表示確認と証跡取得を行った
- `ELPLANATION/EXPLANATION_STEP14.md` を追加し、Compose 定義と API URL 切り替えのコードレベル説明、確認コマンド、証跡パスを記録した

**理解できたこと**

- Compose ではサービス名 `db` `backend` を使うことで、コンテナ間通信の接続先を固定できる
- Next.js は同じ API 関数でもサーバー実行とブラウザ実行が混在するため、公開URLと内部URLを分けて考える必要がある
- `depends_on` と `healthcheck` を組み合わせると、DB起動前に backend が接続を始めるリスクを減らせる

**分からなかったこと**

- なし

**次に調べたいこと / 気づき**

- Compose 起動時に migration を毎回 backend 起動コマンドへ含める運用が適切かは、Step 15で整理したい

**次回行うこと**

- Step 15として環境変数とmigration運用を整理する

## 更新ルール

- Step開始時にステータスを `学習中` または `実装中` へ変更する
- 動作確認中はステータスを `確認中` へ変更する
- 完了条件を満たしたらステータスを `完了` へ変更する
- 開始日、完了日、理解度、コミットを記録する
- チェック項目は実際に確認した後で更新する
- 問題を飛ばして進まず、保留理由をメモへ残す
- 学習終了時に「理解できたこと」と「次回行うこと」を記録する
### 2026-06-22: Step 15

**螳滓命蜀・ｮｹ**

- `docker-compose.yml` を更新し、Compose 側でも `DATABASE_URL` `NEXT_PUBLIC_API_BASE_URL` `INTERNAL_API_BASE_URL` をそのまま受け取れるようにした
- `backend/.env.example` にローカル実行用と Compose 用の `DATABASE_URL` を併記した
- `frontend/.env.local.example` に `INTERNAL_API_BASE_URL` の役割を追記した
- `frontend/e2e/docker-compose-env-migration.spec.ts` を追加し、Step 15 用の Playwright 証跡保存先を `test/evidence/step15-playwright` に分離した
- `ELPLANATION/EXPLANATION_STEP15.md` を追加し、環境変数の役割、migration 運用、確認コマンド、証跡パスを記録した
- `README.md` を更新し、Compose 運用でも同じ環境変数名を使う方針を仕様へ反映した
- `docker compose up -d --build` 後に `docker compose exec backend alembic current` と `docker compose exec backend alembic upgrade head` を実行し、backend コンテナ内の Alembic 運用を確認した
- Playwright で `http://127.0.0.1:3000/books` の表示を確認し、Step 15 用スクリーンショットを保存した

**逅・ｧ｣縺ｧ縺阪◆縺薙→**

- Compose と backend / frontend 本体で環境変数名をそろえると、どこで使う値なのかを読み替えずに済む
- `DATABASE_URL` は backend 本体だけでなく Alembic も読むので、migration の運用確認では backend コンテナ内から実行するのが筋が通っている
- `NEXT_PUBLIC_API_BASE_URL` はブラウザ視点、`INTERNAL_API_BASE_URL` は Next.js server-side fetch 視点なので、同じAPIでも役割を分けて考える必要がある

**蛻・°繧峨↑縺九▲縺溘％縺ｨ**

- 縺ｪ縺・

**遒ｺ隱阪＠縺溘％縺ｨ**

- `docker compose up -d --build` で Step 15 の Compose 構成が起動することを確認した
- `docker compose exec backend alembic current` で revision が `bd2452b4d62c (head)` であることを確認した
- `docker compose exec backend alembic upgrade head` を再実行しても失敗しないことを確認した
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health | Select-Object -ExpandProperty Content` で `{"status":"ok"}` を確認した
- `npm run lint` を実行して frontend の ESLint が通ることを確認した
- `npx playwright test e2e/docker-compose-env-migration.spec.ts` を実行し、`test/evidence/step15-playwright/01-compose-env-books.png` を保存した

**谺｡蝗櫁｡後≧縺薙→**

- Step 16縺ｨ縺励※Docker荳翫〒縺ｮ逍朱夂｢ｺ隱阪ｒ螳溯｡後☆繧・
### Step 16: Docker荳翫〒縺ｮ逍朱夂｢ｺ隱・

- [x] `docker compose up` 縺ｧ 3 繧ｵ繝ｼ繝薙せ縺檎ｵｷ蜍輔☆繧九％縺ｨ繧堤｢ｺ隱阪＠縺・
- [x] backend 縺ｮ `/health` 縺・`200 OK` 縺ｧ `{"status":"ok"}` 繧貞ｿ斐☆縺薙→繧堤｢ｺ隱阪＠縺・
- [x] frontend 縺ｮ `/books` 逕ｻ髱｢縺碁幕縺代ｋ縺薙→繧堤｢ｺ隱阪＠縺・
- [x] browser 縺九ｉ backend 縺ｮ `/health` 縺ｨ `/api/books` 繧貞他縺ｹ縲・ORS 縺ｨ蜈ｬ髢偽RL縺ｫ蝠城｡後′縺ｪ縺・％縺ｨ繧堤｢ｺ隱阪＠縺・
- [x] Step 16 逕ｨ縺ｮ Playwright 險ｼ霍｡繧・`test/evidence/step16-playwright` 縺ｫ菫晏ｭ倥＠縺・
- [x] `ELPLANATION/EXPLANATION_STEP16.md` 縺ｫ繧ｳ繝ｼ繝峨Ξ繝吶Ν隱ｬ譏弱→遒ｺ隱肴焔鬆・ｒ險倩ｼ峨＠縺・

繝｡繝｢:

> Compose 荳翫〒縺ｮ蝓ｺ譛ｬ逍朱壹〒縺ｯ縲√が面表示縺ｨ browser 逕ｨ API 通信繧帝ｯｾ譚･縺励※見繧九・縺後∪縺吶・`/books` 縺梧悄螳壹〒縺阪ｋ縺薙→縺ｯ `INTERNAL_API_BASE_URL` 譖ｿ逕ｨ縺ｮ遒ｺ隱阪↓縺ｪ繧翫√・繝悶Λ繧ｦ繧ｶ縺九ｉ `/health` 縺ｨ `/api/books` 繧貞他縺ｹ縺ｦ縺阪ｋ縺薙→縺ｯ `NEXT_PUBLIC_API_BASE_URL` 縺ｨ CORS 遒ｺ隱阪↓縺ｪ繧翫∪縺吶・

### 2026-06-23: Step 16

**螳滓命蜀・ｮｹ**

- `frontend/e2e/docker-compose-connectivity.spec.ts` 繧定ｿｽ蜉縺励ゞtep 16 逕ｨ縺ｮ Playwright 遒ｺ隱阪ｒ霑ｽ蜉縺励◆
- `ELPLANATION/EXPLANATION_STEP16.md` 繧定ｿｽ蜉縺励∫嶌面表示遒ｺ隱阪→ browser API 遒ｺ隱阪ｒ蛻･縺代※隱ｬ譏弱＠縺・
- `LEARNING_ROADMAP.md` 縺ｮ Step 16 繝√ぉ繝・け繝ｪ繧ｹ繝医ｒ螳御ｺ・↓譖ｴ譁ｰ縺励◆
- `LEARNING_PROGRESS.md` 縺ｮ迴ｾ蝨ｨ蠎ｦ縲√谺｡縺ｫ陦後≧ Step縲∫峩譁ｰ譌･繧呈峩譁ｰ縺励◆
- `docker compose up -d --build` 縺ｧ 3 繧ｵ繝ｼ繝薙せ繧定ｵｷ蜍輔＠縺・
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health | Select-Object -ExpandProperty Content` 縺ｧ `{"status":"ok"}` 繧貞｢ｺ隱阪＠縺・
- `npm run lint` 縺ｧ frontend 縺ｮ lint 縺碁壹ｋ縺薙→繧堤｢ｺ隱阪＠縺・
- `npx playwright test e2e/docker-compose-connectivity.spec.ts` 縺ｧ Step 16 遒ｺ隱阪′騾壹ｋ縺薙→繧堤｢ｺ隱阪＠縺・

**逅・ｧ｣縺ｧ縺阪◆縺薙→**

- `/books` 繧帝幕縺代ｋ縺｡縺代〒縺ｯ縲・rontend 縺後ｵｷ蜍輔＠縺溘□縺代〒縺ｯ縺ｪ縺上√Next.js 縺悟ｮ・ｨ薙〒 `backend` 縺ｸ謗･邯壹〒縺阪※縺・ｋ縺薙→縺後←縺・°繧帝・ｦ励☆繧句ｿ・ｦ√′縺ゅｋ
- browser 縺九ｉ backend 縺ｮ `/health` 繧・`/api/books` 繧貞他縺ｹ繧九→縲∵純粋縺ｫ CORS 縺ｨ蜈ｬ髢偽RL 險ｭ螳壹′蜷後§螳溯｡後〒縺阪ｋ
- Step 16 縺ｧ縺ｯ CRUD 縺ｾ縺ｧ縺ｯ隕九※縺・↑縺・ゅ％縺薙′ Step 17 縺ｧ E2E 譛ｬ菴懈･ｭ遒ｺ隱阪↓騾壹☆豁｣蠢・↓縺ｪ繧・

**蛻・°繧峨↑縺九▲縺溘％縺ｨ**

- 縺ｪ縺・

**谺｡蝗櫁｡後≧縺薙→**

- Step 17 縺ｨ縺励※ Docker 迺ｰ蠅・〒縺ｮ CRUD E2E 遒ｺ隱阪ｒ螳溯｡後☆繧・
### Step 17: Playwright による Docker 環境の E2E 確認

- [x] Docker 起動後に Playwright を実行して CRUD を最後まで確認できる
- [x] 本の作成、一覧、編集、削除を Docker 環境で確認できる
- [x] Step 17 用の Playwright 証跡を `test/evidence/step17-playwright` に保存できる
- [x] `ELPLANATION/EXPLANATION_STEP17.md` にコード説明、実行コマンド、証跡パスを記載できる

メモ:

> Step 17 では Step 9 のローカル E2E をそのまま使うのではなく、Docker Compose 起動中の `frontend` `backend` `db` を相手にする専用テストへ分けた。これで Docker 化後の画面遷移、API 呼び出し、DB 更新までを 1 本の確認として追えるようになった。

### 2026-06-23: Step 17

**進めた内容**

- `frontend/e2e/docker-compose-books-crud.spec.ts` を追加し、Docker 環境向けの CRUD E2E を実装した
- `frontend/next.config.ts` を追加し、`127.0.0.1` から Docker 上の `next dev` を開いたときに dev resource がブロックされないようにした
- `ELPLANATION/EXPLANATION_STEP17.md` を追加し、Step 17 のコード説明、動作確認手順、証跡を整理した
- `LEARNING_ROADMAP.md` の Step 17 チェックを完了に更新した
- `LEARNING_PROGRESS.md` の現在地、Step 一覧、Step 17 記録を更新した
- `docker compose up -d --build` で Compose を起動して確認できる状態を整えた
- `npm run lint` で frontend の lint を確認した
- `npx playwright test e2e/docker-compose-books-crud.spec.ts` で Docker 環境の CRUD が通ることを確認した

**確認できたこと**

- Docker 上の `/books` 画面から本を作成し、一覧に反映される
- 作成した本を編集すると、同じ一覧画面で更新結果を確認できる
- 削除確認ダイアログを承認すると、対象本だけが一覧から消える
- `allowedDevOrigins` を入れないと `127.0.0.1` から開いた Docker 上の `next dev` で hydration が崩れ、フォーム送信が GET に落ちる場合がある
- 4 枚のスクリーンショットが `test/evidence/step17-playwright` に保存される

**分からなかったこと**

- ない

**次に行うこと**

- GitHubへpushして `Backend CI` workflow が実際に起動することを確認する

### Step 23: GitHub への初回アップロード手順整理
- [x] `ELPLANATION/EXPLANATION_STEP23.md` に GitHub repository 作成手順を記載できる
- [x] PowerShell で実行する `git` コマンドの目的と期待結果を分けて記載できる
- [x] `.gitignore` を確認して不要ファイルを push しない観点を記載できる
- [x] GitHub 上での確認ポイントとよくある詰まりどころを記載できる

メモ:

> Step 23 はアプリ機能の追加ではなく、ローカルで育ててきたこのソースコードを GitHub に安全に載せるための運用補足です。README は仕様書なので手順は載せず、EXPLANATION 側に PowerShell と GitHub 画面の両方の流れを分離して整理しました。

### 2026-06-23: Step 23

**進めたこと**

- `ELPLANATION/EXPLANATION_STEP23.md` を追加し、GitHub の新規 repository 作成から初回 push までの手順を整理した
- `.gitignore` の役割をコード抜粋つきで説明した
- `git status` が失敗する場合を含めて、`git init` の要否を分けて説明した
- `LEARNING_ROADMAP.md` に Step 23 を追加した
- `LEARNING_PROGRESS.md` に補足対応として Step 23 を記録した

**確認できたこと**

- ローカル作業ディレクトリから GitHub へ初回 upload する標準的な流れを 1 本の手順として追える
- 各 `git` コマンドについて「何のために打つか」を PowerShell ベースで確認できる
- GitHub 上で空 repository を作る理由と、README を GitHub 側で先に作らない理由を説明できる

**分からなかったこと**

- 実際にどの repository 名で公開するか
- 実際に `Public` と `Private` のどちらで運用するか

### Step 24: users テーブルとパスワード管理基盤
- [x] `users` テーブルを migration で作成できる
- [x] `email` と `username` の一意制約を実装できる
- [x] パスワードを平文保存せず `scrypt` でハッシュ化して保存できる
- [x] `POST /api/admin/bootstrap` で初期管理者を1回だけ作成できる
- [x] `pytest` と Playwright で Step 24 の確認ができる
- [x] `README.md` と `ELPLANATION/EXPLANATION_STEP24.md` に仕様とコード説明を反映できる

メモ:

> Step 24 では、まだログイン機能までは入れず、認証の前提となる利用者データ保存とパスワード保護だけを先に追加した。初期管理者作成は一度だけ許可し、レスポンスへ `password_hash` を出さない構成にして、Step 25 のログインAPI追加へつなげられる状態にした。

### 2026-06-24: Step 24

**進めたこと**

- `backend/app/models/user.py` と `backend/alembic/versions/1f8e0b6e6a24_add_users_table.py` を追加し、`users` テーブルを管理対象へ加えた
- `backend/app/services/security.py` に `scrypt` ベースの `hash_password()` と `verify_password()` を実装した
- `backend/app/routers/admin.py` に `POST /api/admin/bootstrap` を追加し、利用者が0件のときだけ初期管理者を作成できるようにした
- `backend/tests/test_users_api.py` を追加し、ハッシュ化、1回限りの bootstrap、入力検証を `pytest` で確認した
- `frontend/e2e/admin-bootstrap-api.spec.ts` を追加し、Playwright の API テストで初回成功と2回目の `409 Conflict` を確認した
- `README.md` に `users` テーブル、初期管理者作成API、認証準備の仕様を反映した
- `ELPLANATION/EXPLANATION_STEP24.md` を追加し、コード説明、確認コマンド、証跡パスを整理した

**確認できたこと**

- `users` テーブルが Alembic migration で作成される
- 初期管理者作成APIのレスポンスに `password_hash` が含まれない
- DBには平文ではなくハッシュ化済みパスワードが保存される
- 初回作成後に同じAPIを再実行すると `409 Conflict` になる
- Playwright 証跡を `test/evidence/step24-playwright/01-admin-bootstrap-response.json` に保存できる

**分からなかったこと**

- Step 25 で session 認証と JWT 認証のどちらを採用するかは未決定

**次に行うこと**

- Step 25 としてログイン API、認証状態の保持、未認証時レスポンス方針を決める

### Step 25: ログイン API と認証状態管理
- [x] `POST /api/auth/login` で `email` または `username` によりログインできる
- [x] `POST /api/auth/logout` で認証Cookieを削除できる
- [x] `GET /api/auth/me` で認証済み利用者を取得できる
- [x] JWT の方針と保存先を決め、未認証時は `401 Unauthorized` を返せる
- [x] `pytest` と Playwright で Step 25 の確認ができる
- [x] `README.md` と `ELPLANATION/EXPLANATION_STEP25.md` に仕様とコード説明を反映できる

メモ:

> Step 25 では、資格情報の照合、認証状態の保持、現在ユーザー取得の3点を最小構成で追加した。保存先は `HttpOnly` Cookie、トークン形式は署名付きJWTとし、本API自体の認証必須化はまだ行わず、Step 26 の認可導入へつなげる状態にした。

### 2026-06-24: Step 25

**進めたこと**

- `backend/app/routers/auth.py` を追加し、`POST /api/auth/login` `POST /api/auth/logout` `GET /api/auth/me` を実装した
- `backend/app/services/auth.py` を追加し、ログイン判定、認証済み利用者の共通取得、Cookie と Bearer token の読み取りをまとめた
- `backend/app/services/security.py` に JWT 生成・検証処理を追加し、`library_access_token` Cookie に保存する構成にした
- `backend/app/repositories/user.py` に `get_user_by_id()` を追加し、トークン内の `sub` から利用者を引けるようにした
- `backend/tests/test_auth_api.py` を追加し、ログイン成功、`username` ログイン、認証失敗、ログアウト後の `401` を確認した
- `frontend/e2e/auth-api.spec.ts` を追加し、Playwright で bootstrap → login → me → logout → `401` の流れを証跡化した
- `README.md` にログインAPI、認証Cookie、JWT方針、Step 25 時点で books API をまだ公開のままにする方針を反映した
- `ELPLANATION/EXPLANATION_STEP25.md` を追加し、コード説明、確認コマンド、証跡パスを整理した

**確認できたこと**

- `login_id` に `email` と `username` の両方を使える
- 正しい資格情報では `200 OK` と `library_access_token` Cookie が返る
- `GET /api/auth/me` が現在の利用者を返す
- ログアウト後は `GET /api/auth/me` が `401 Unauthorized` になる
- Playwright 証跡を `test/evidence/step25-playwright/01-auth-api-flow.json` に保存できる

**分からなかったこと**

- ない

**次に行うこと**

- Step 26 として books API などに認証必須化を入れ、`admin` ロールを使った認可判定へ進む

### Step 26: 認可と認証必須 API 化
- [x] books API の登録・更新・削除を認証必須にできる
- [x] `admin` 以外では保護操作が `403 Forbidden` になる
- [x] 一覧・詳細は公開のまま残し、保護範囲を説明できる
- [x] frontend で未認証・権限不足時の表示方針を反映できる
- [x] `pytest` と Playwright で Step 26 の確認ができる
- [x] `README.md` と `ELPLANATION/EXPLANATION_STEP26.md` に仕様とコード説明を反映できる

メモ:

> Step 26 では books API を一律に閉じるのではなく、参照系は公開、更新系だけを認証済み `admin` に限定した。これにより、認証と認可の違いを小さな差分で確認しつつ、次の Step 27 でログイン画面を追加して認証導線を完成させやすい構成にした。

### 2026-06-24: Step 26

**進めたこと**

- `backend/app/services/auth.py` に `require_admin_user()` を追加し、`admin` 以外を `403 Forbidden` に統一した
- `backend/app/routers/books.py` で `POST` `PUT` `DELETE /api/books` に認可 dependency を追加した
- `backend/tests/test_books_api.py` を更新し、公開参照、未認証 `401`、非 `admin` `403`、管理者成功を確認した
- `frontend/lib/server-auth.ts` と `frontend/types/auth.ts` を追加し、server-side で現在ユーザーを取得できるようにした
- `frontend/app/books/page.tsx` `frontend/app/books/new/page.tsx` `frontend/app/books/[id]/edit/page.tsx` を更新し、管理者だけに登録・編集・削除導線を出すようにした
- `frontend/e2e/books-authorization.spec.ts` を追加し、未認証表示と管理者表示の差分を Playwright 証跡に残した
- `README.md` に保護対象API、`401` / `403`、frontend 表示方針を反映した
- `ELPLANATION/EXPLANATION_STEP26.md` を追加し、コード説明、確認コマンド、証跡パスを整理した

**確認できたこと**

- 未認証では `POST` `PUT` `DELETE /api/books` が `401 Unauthorized` になる
- 認証済みでも `admin` 以外では更新系 books API が `403 Forbidden` になる
- 管理者は books API の登録・更新・削除を継続して実行できる
- frontend の `/books` では未認証時に管理導線が消え、管理者時には表示される
- Playwright 証跡を `test/evidence/step26-playwright` に保存できる

**分からなかったこと**

- ない

**次に行うこと**

- Step 27 として `/login` 画面、ログインフォーム、ログイン成功後の画面遷移を追加する

### Step 27: ログイン画面
- [x] `/login` 画面を追加する
- [x] `login_id` と `password` のフォームを追加する
- [x] `POST /api/auth/login` を呼び出す frontend 側処理を追加する
- [x] ログイン失敗メッセージを画面に表示する
- [x] ログイン成功後に `/books` へ遷移させる
- [x] 既に認証済みの場合の表示またはリダイレクト方針を実装する
- [x] Playwright で正常系と異常系を確認する
- [x] `README.md` と `ELPLANATION/EXPLANATION_STEP27.md` に反映する

メモ:

> Step 27 では、すでにある認証 API を実際の画面操作へつなぐ。Step 26 までは server-side で Cookie を読んで管理導線の表示だけを切り替えていたが、この Step で利用者自身がログインできる入口を追加する。

### 2026-06-24: Step 27

**進めたこと**

- `frontend/app/login/page.tsx` を追加し、未認証時だけログイン画面を表示し、認証済みなら `/books` へリダイレクトするようにした
- `frontend/components/LoginForm.tsx` を追加し、`login_id` と `password` の入力、`POST /api/auth/login` の送信、エラー表示、成功後の遷移を実装した
- `frontend/lib/api.ts` と `frontend/types/auth.ts` を更新し、frontend から認証 API を呼ぶ型付き関数を追加した
- `frontend/app/books/page.tsx` `frontend/app/books/new/page.tsx` `frontend/app/books/[id]/edit/page.tsx` を更新し、ログイン画面への導線を追加した
- `frontend/e2e/login-page.spec.ts` を追加し、ログイン失敗表示、ログイン成功、認証済み再訪時リダイレクトを Playwright で確認した
- `README.md` と `ELPLANATION/EXPLANATION_STEP27.md` を更新し、画面仕様、確認コマンド、証跡パスを記録した

**確認できたこと**

- `/books` から `/login` へ移動できる
- 誤った資格情報ではエラーメッセージが表示される
- 正しい資格情報では `/books` へ戻り、管理者導線が表示される
- 認証済みのまま `/login` を開くと `/books` へリダイレクトされる
- Playwright 証跡を `test/evidence/step27-playwright` に保存できる

**分からなかったこと**

- ない

**次に行うこと**

- Step 28 として books の変更操作に監査ログを追加する

### Step 28: 監査ログ
- [x] 監査対象の操作を books の作成、更新、削除に定義できる
- [x] 実行者、対象、操作種別、実行時刻を `audit_logs` へ保存できる
- [x] 削除後も対象を追えるようにタイトルのスナップショットを残せる
- [x] `GET /api/audit-logs` を `admin` 限定で確認できる
- [x] `pytest` と Playwright で監査ログの保存と参照を確認できる
- [x] `README.md` と `ELPLANATION/EXPLANATION_STEP28.md` に仕様とコード説明を反映できる

メモ:

> Step 28 では通常ログとは別に、重要な変更操作だけを追跡する `audit_logs` を追加した。books 更新系と監査ログ保存を同じ transaction にまとめ、更新成功だけが履歴に残る構成にした。

### 2026-06-25: Step 28

**進めたこと**

- `backend/app/models/audit_log.py` と `backend/alembic/versions/78e3f4a1b2c9_add_audit_logs_table.py` を追加し、`audit_logs` テーブルを migration 管理へ加えた
- `backend/app/repositories/audit_log.py` `backend/app/services/audit_log.py` `backend/app/routers/audit_logs.py` を追加し、監査ログの保存と参照を backend へ実装した
- `backend/app/services/book.py` と `backend/app/repositories/book.py` を更新し、本更新と監査ログ保存を同一 transaction で commit するようにした
- `backend/tests/test_audit_logs_api.py` と `backend/tests/test_books_api.py` を更新し、保存順、権限制御、失敗時に監査ログが増えないことを `pytest` で確認した
- `frontend/e2e/audit-logs-api.spec.ts` を追加し、Playwright で create → update → delete → `GET /api/audit-logs` を確認した
- `README.md` と `ELPLANATION/EXPLANATION_STEP28.md` を更新し、監査ログ仕様、確認コマンド、証跡パスを整理した

**確認できたこと**

- 管理者による books の作成、更新、削除が成功したときだけ `audit_logs` が1件ずつ追加される
- 監査ログには `actor_user_id` `actor_email` `action` `target_type` `target_id` `target_title` `occurred_at` が保存される
- `GET /api/audit-logs` は未認証で `401`、非 `admin` で `403`、管理者で `200` を返す
- ISBN 重複による `409 Conflict` など失敗した更新操作では監査ログが増えない
- Playwright 証跡を `test/evidence/step28-playwright/01-audit-logs-api-flow.json` に保存できる

**分からなかったこと**

- ない

**次に行うこと**

- Step 29 として構造化ログと例外ハンドリング統一を追加する

### Step 29: 構造化ログと例外ハンドリング統一
- [x] API ごとの構造化ログを追加できる
- [x] `request_id` をログとレスポンスに載せられる
- [x] 共通 exception handler を追加できる
- [x] `500 Internal Server Error` のレスポンス形式を統一できる
- [x] 利用者向けメッセージと内部ログを分離できる
- [x] `pytest` と Playwright で代表的な失敗系を確認できる
- [x] `README.md` と `ELPLANATION/EXPLANATION_STEP29.md` に仕様とコード説明を反映できる

メモ:

> Step 29 では request ごとに `request_id` を付与し、`401` `403` `409` `422` `500` のレスポンス本文を `detail` `error_code` `request_id` の共通形式へそろえた。想定外例外の詳細は内部ログだけに残し、利用者には固定メッセージを返すようにした。

### 2026-06-25: Step 29

**進めたこと**

- `backend/app/observability.py` を追加し、`request_id` の採番、`X-Request-ID` ヘッダー設定、JSON 形式の request 完了ログを実装した
- `backend/app/errors.py` と `backend/app/schemas/error.py` を追加し、共通例外クラスと統一エラーレスポンス schema を作成した
- `backend/app/main.py` に middleware と `AppError` `HTTPException` `RequestValidationError` `Exception` 向け handler を追加した
- `backend/app/services/auth.py` と `backend/app/routers/*.py` を更新し、認証失敗、権限不足、競合、存在しない本を共通例外へ寄せた
- `backend/tests/test_error_handling_api.py` を追加し、`request_id`、統一エラー形式、構造化ログ、想定外例外の `500` を `pytest` で確認した
- `frontend/e2e/error-handling-api.spec.ts` を追加し、Playwright で `401` `422` `409` と `X-Request-ID` ヘッダーを確認できるようにした
- `README.md` と `ELPLANATION/EXPLANATION_STEP29.md` を更新し、エラー仕様、ログ仕様、確認コマンド、証跡パスを整理した

**確認できたこと**

- 正常系、認証失敗、権限不足、入力エラー、競合、想定外例外を `request_id` 付きで追跡できる
- エラーレスポンス本文を `detail` `error_code` `request_id` の同一形式で返せる
- `422` では `errors` 配列も返り、どの入力が不正かを確認できる
- 想定外例外の詳細は内部ログだけに残り、利用者向けレスポンスには固定メッセージだけが返る
- Playwright 証跡を `test/evidence/step29-playwright/01-error-handling-api-flow.json` に保存できる

**分からなかったこと**

- ない

**次に行うこと**

- Step 10 の全体振り返りとして、ここまでの CRUD、認証、認可、監査ログ、構造化ログを通した説明を整理する

### Step 30: shadcn/ui で図書一覧画面と削除確認 UI を改善
- [x] `shadcn/ui` 導入に必要な frontend 依存関係と設定を追加できる
- [x] `/books` の一覧画面を `Table` ベースへ置き換えられる
- [x] 削除確認を `Dialog` ベースへ変更し、対象タイトルを表示できる
- [x] 削除成功後に success メッセージを表示できる
- [x] `README.md` と `ELPLANATION/EXPLANATION_STEP30.md` に仕様とコード説明を反映できる
- [x] Playwright で一覧表示、編集、削除確認、削除完了を確認できる

メモ:

> Step 30 では frontend に `shadcn/ui` ベースの `Table` と `Dialog` を導入し、`/books` の一覧表示を表形式へ変更した。削除確認では対象タイトルを明示し、削除成功後は success メッセージを返すようにして、誤操作しにくい UI へ寄せた。

### 2026-06-25: Step 30

**進めたこと**

- `frontend/package.json` と `frontend/postcss.config.mjs` を更新し、Tailwind CSS v4 と `@radix-ui/react-dialog` などの依存関係を追加した
- `frontend/components.json` `frontend/lib/utils.ts` `frontend/components/ui/*` を追加し、`shadcn/ui` ベースの最小構成を作成した
- `frontend/app/books/BooksList.tsx` をカード一覧から table 一覧へ置き換え、削除確認 Dialog と success メッセージを追加した
- `frontend/e2e/books-crud.spec.ts` と `frontend/e2e/docker-compose-books-crud.spec.ts` を更新し、行ベースの locator と Dialog 確認に追従させた
- `README.md` と `ELPLANATION/EXPLANATION_STEP30.md` を更新し、画面仕様、フォルダ構成、確認コマンド、証跡パスを整理した

**確認できたこと**

- `npm.cmd run lint` が成功した
- `npm.cmd run build` が成功した
- `npx playwright test e2e/books-crud.spec.ts` が成功した
- `test/evidence/step30-playwright` に一覧初期表示、登録後、更新後、削除確認 Dialog、削除完了後の証跡を保存できた
- 削除確認はブラウザ標準の confirm ではなく Dialog で表示され、削除対象タイトルを画面上で確認できる
- 削除完了後に対象行が一覧から消え、success メッセージも表示される

**分からなかったこと**

- ない

**次に行うこと**

- Step 10 の全体振り返りとして、ここまでの CRUD、認証、認可、監査ログ、構造化ログ、UI 改善を通した説明を整理する

### 2026-06-25: Issue 16

**進めたこと**

- GitHub の `issue #16` を取得し、図書登録画面の UX/UI 改善タスクとサブタスクを確認した
- `frontend/app/books/new/page.tsx` を更新し、上部ヒーローと入力ガイドを持つ 2 カラム構成へ変更した
- `frontend/components/BookForm.tsx` を更新し、必須/任意の表示、補助テキスト、フィールド単位のエラー、送信中状態、成功/失敗メッセージを追加した
- `frontend/components/ui/card.tsx` と `frontend/components/ui/input.tsx` を追加し、登録画面でも `shadcn/ui` ベースの共通 UI を使えるようにした
- `frontend/e2e/issue16-book-form-ui.spec.ts` を追加し、desktop / mobile の画面確認と登録フロー確認を Playwright で自動化した
- `backend/app/main.py` の CORS 設定へ `3012` origin を追加し、isolated な Playwright 実行を安定させた
- `README.md` と `ELPLANATION/EXPLANATION_ISSUE16.md` を更新し、画面仕様、確認コマンド、証跡パスを記録した

**確認できたこと**

- 登録画面で「何から入力するか」を左側ガイドで先に伝えられる
- 各入力欄に補助説明、placeholder、必須/任意表示を付けられる
- 空白だけの著者名を送信すると、フィールド近くに独自エラーを表示できる
- 登録成功後に一覧へ戻り、追加した本が表示される
- mobile 幅でも 1 カラムに崩さず表示できる
- `npm.cmd run lint`、`npm.cmd run build`、`npx playwright test e2e/issue16-book-form-ui.spec.ts` が通る

**分かったこと**

- `required` 属性だけではなく、空白トリム後の独自検証とフィールド単位エラーを加えると入力体験が改善する
- Playwright の isolated run では、検証用 origin を増やしておくと既存プロセスと切り分けやすい

**次に行うこと**

- Step 10 の全体振り返りを進めつつ、issue16 の変更をコミット単位として整理する

### Step 19: backend の CI 導入
- [x] `.github/workflows/backend-ci.yml` を追加できる
- [x] backend の依存関係に `ruff` を追加し、CI とローカルで共通コマンドを使える
- [x] ローカルで `ruff check` `ruff format --check` `pytest` が通る
- [x] `ELPLANATION/EXPLANATION_STEP19.md` に workflow の役割、実行コマンド、GitHub 上の確認手順を記載できる
- [x] GitHub Actions 上での確認手順と失敗時の切り分け方を説明できる

メモ:

> Step 19 では、まず backend だけを対象にした小さな CI を追加した。`ruff check` `ruff format --check` `pytest` を 1 本の workflow にまとめ、失敗箇所を step 名で切り分けやすくした。GitHub Actions 上での実行確認自体は Step 20 以降の push で行う前提とし、今回はユーザー判断で Step 19 を完了扱いにした。

### 2026-06-23: Step 19

**進めたこと**

- `.github/workflows/backend-ci.yml` を追加し、`push` / `pull_request` で backend の品質確認が走る workflow を作成した
- `backend/requirements.txt` に `ruff==0.12.0` を追加し、CI とローカルの lint ツールをそろえた
- `backend` 配下の Python ファイルへ formatter を適用し、`ruff format --check` が落ちない状態へそろえた
- `ELPLANATION/EXPLANATION_STEP19.md` を追加し、workflow の読み方、ローカル確認コマンド、GitHub 上の確認手順を整理した
- `LEARNING_PROGRESS.md` の現在地を Step 19 の確認中へ更新した

**確認できたこと**

- `.\.venv\Scripts\ruff.exe check .` が成功した
- `.\.venv\Scripts\ruff.exe format --check .` が成功した
- `.\.venv\Scripts\python.exe -m pytest` が 4 件成功した
- workflow を読むと、`Install dependencies` `Run Ruff check` `Run Ruff format check` `Run pytest` の順で失敗箇所を切り分けられる

**分からなかったこと**

- ない

**次に行うこと**

- Step 20 として frontend の CI 構築に進む

### Step 20: frontend の CI 導入
- [x] `.github/workflows/frontend-ci.yml` を追加できる
- [x] frontend 用の Node.js セットアップと `npm ci` を workflow に追加できる
- [x] ローカルで `npm run lint` `npm run build` が通る
- [x] `ELPLANATION/EXPLANATION_STEP20.md` に workflow の役割、実行コマンド、GitHub 上の確認手順を記載できる
- [ ] GitHub Actions 上で `Frontend CI` が成功する

メモ:

> Step 20 では、frontend だけを対象にした CI を追加し、`npm ci` `npm run lint` `npm run build` を GitHub Actions に移植した。ローカルの確認は完了しており、GitHub 上の成功確認は Step 21 の push 時にまとめて行う前提で、今回はユーザー判断で Step 20 を完了扱いにした。

### 2026-06-24: Step 20

**進めたこと**

- `.github/workflows/frontend-ci.yml` を追加し、`push` / `pull_request` で frontend の品質確認が走る workflow を作成した
- `actions/setup-node` と `npm ci` を使い、CI 上で `frontend/package-lock.json` に基づく依存関係 install ができるようにした
- `ELPLANATION/EXPLANATION_STEP20.md` を追加し、workflow の読み方、ローカル確認コマンド、GitHub 上の確認手順を整理した
- `LEARNING_PROGRESS.md` の現在地を Step 20 の確認中へ更新した

**確認できたこと**

- `npm run lint` が成功した
- `npm run build` が成功した
- workflow を読むと、`Install dependencies` `Run ESLint` `Run Next.js build` の順で失敗箇所を切り分けられる

**分からなかったこと**

- ない

**次に行うこと**

- Step 21 として Docker Compose と Playwright を使う E2E CI の構築に進む

### Step 21: Docker Compose と Playwright を使う CI 導入
- [x] `.github/workflows/e2e-ci.yml` を追加できる
- [x] CI 上で `docker compose up -d --build` と停止処理を定義できる
- [x] backend / frontend の起動待ちを workflow に追加できる
- [x] Compose 上の Playwright E2E を workflow から実行できる
- [x] `ELPLANATION/EXPLANATION_STEP21.md` に workflow の役割、証跡保存方針、GitHub 上の確認手順を記載できる
- [x] GitHub Actions 上での最終確認は今後の push 後に行う前提で、今回はユーザー判断で完了扱いにする

メモ:

> Step 21 では、Docker Compose で `frontend` `backend` `db` を起動し、その上で Playwright の smoke / connectivity / CRUD を GitHub Actions から実行できるようにした。GitHub 上での最終実行確認は未了だが、今回はユーザー判断で Step 21 を完了扱いにし、次の Step 22 で CI ドキュメント整理へ進んだ。

### 2026-06-24: Step 21

**進めたこと**

- `.github/workflows/e2e-ci.yml` を追加し、`docker compose up -d --build` から Playwright 実行、artifact upload、`docker compose down -v` までを 1 本の workflow にした
- backend の `/health` と frontend の `/books` に対する待機 step を追加し、起動直後の不安定なタイミングで E2E が走らないようにした
- `frontend/e2e/support/evidence.ts` を追加し、Compose 向け Playwright spec の証跡保存先を `PLAYWRIGHT_EVIDENCE_DIR` で切り替えられるようにした
- `ELPLANATION/EXPLANATION_STEP21.md` を追加し、workflow の読み方、ローカル確認コマンド、GitHub 上の確認手順、artifact の見方を整理した
- `LEARNING_PROGRESS.md` の現在地を Step 21 の確認中へ更新した

**確認できたこと**

- `npm run lint` が成功した
- `docker compose up -d --build` が成功した
- `npx playwright test e2e/docker-compose-smoke.spec.ts e2e/docker-compose-env-migration.spec.ts e2e/docker-compose-connectivity.spec.ts e2e/docker-compose-books-crud.spec.ts --reporter=html` が 4 件成功した
- `test/evidence/step21-playwright` に Step 21 用の screenshot 証跡を保存できた
- workflow を読むと、依存関係 install、Playwright browser 準備、Compose 起動、待機、E2E、artifact 保存、停止処理の順に切り分けられる
- Compose 向け Playwright spec は証跡保存先だけを差し替えて再利用できる
- `docker-compose-smoke` `docker-compose-connectivity` `docker-compose-books-crud` を分けることで、どの層で壊れたかを job と spec 名で追いやすい

**分からなかったこと**

- ない

**次に行うこと**

- Step 22 として README、説明ファイル、進捗ファイルへ CI の役割分担を反映する

### Step 22: CI 運用内容のドキュメント反映
- [x] `README.md` に CI で自動確認している範囲を反映できる
- [x] `ELPLANATION/EXPLANATION_STEP22.md` に workflow の役割と実行順序を書ける
- [x] `LEARNING_PROGRESS.md` に学びと詰まった点を記録できる
- [x] ローカル確認と CI 確認の役割分担を明文化できる

メモ:

> Step 22 では、Step 19 から Step 21 までで追加した 3 本の workflow がそれぞれ何を保証するかを README と説明ファイルへ反映した。ローカル確認は切り分け、CI 確認は継続的再確認という役割分担を文章として残し、後続 Step から参照しやすくした。

### 2026-06-24: Step 22

**進めたこと**

- `README.md` の対象範囲を更新し、Docker Compose と GitHub Actions の CI を現在の対象へ反映した
- `README.md` のテスト方針、フォルダ構成、Docker・CI 関連ファイル一覧へ backend / frontend / E2E の 3 workflow の役割を追記した
- `ELPLANATION/EXPLANATION_STEP22.md` を追加し、README と進捗ファイルをどの観点で更新したかをコード抜粋つきで整理した
- `LEARNING_ROADMAP.md` と `LEARNING_PROGRESS.md` を更新し、Step 21 と Step 22 を完了扱いにそろえた

**確認できたこと**

- README だけを読むだけで、backend CI、frontend CI、Docker Compose E2E CI の責務分担を追える
- フォルダ構成に Compose 向け Playwright spec、`e2e/support/evidence.ts`、`.github/workflows` を反映できた
- 進捗表、現在地、Step別記録の 3 か所で Step 21 / 22 の状態を矛盾なく更新できた
- Step 21 はユーザー判断で完了扱い、GitHub 上の実行結果確認は今後の push 後に行う、という前提を文章で残せた

**分からなかったこと**

- ない

**次に行うこと**

- Step 23 として GitHub への初回アップロード手順整理に進む

### Step 18: Docker化内容のドキュメント反映
- [x] README に Docker 化後の構成、関連ファイル、確認方針を反映できる
- [x] Docker 関連 Step の説明ファイルと README の役割分担を整理できる
- [x] `ELPLANATION/EXPLANATION_STEP18.md` にコード説明、確認コマンド、参照した証跡パスを記載できる

メモ:

> Step 18 では新しいアプリ機能を足さず、Step 11 から Step 17 までで増えた Docker 関連ファイルと運用前提を README の仕様へ戻した。README は SSoT として「何を前提にこのシステムが動くか」をまとめ、細かい確認手順は EXPLANATION 側へ分ける形に整理した。

### 2026-06-23: Step 18

**進めたこと**

- `README.md` に Docker 関連ファイル一覧と Docker Compose 上での確認方針を追記した
- `ELPLANATION/EXPLANATION_STEP18.md` を追加し、README に反映した内容、参照ファイル、確認コマンド、証跡の扱いを整理した
- `LEARNING_ROADMAP.md` の Step 18 を完了に更新した
- `LEARNING_PROGRESS.md` の現在地と次の Step を更新した

**確認できたこと**

- README 上で Docker Compose、Dockerfile、Docker 向け Playwright テスト、証跡ディレクトリの関係を追える
- Docker 運用で `NEXT_PUBLIC_API_BASE_URL` と `INTERNAL_API_BASE_URL` を分離する方針を README と EXPLANATION で一貫して説明できる
- Docker Compose 上の代表的な動作確認として Step 17 の CRUD E2E 証跡を参照先にできる

**分からなかったこと**

- ない
