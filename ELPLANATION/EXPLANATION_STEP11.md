# Step 11: Docker化の前提整理

## このStepの目的

Step 11では、Dockerfile や `docker-compose.yml` をまだ作らず、Docker化を始める前に詰まりやすい前提条件を整理しました。

今回の主な確認対象は次の3点です。

- backend の依存関係がそのまま install できるか
- backend / frontend の起動条件が整理されているか
- 環境変数の役割がローカル実行と将来の Docker Compose 実行で混同されないか

## 追加・変更したファイル

| ファイル | 役割 |
| --- | --- |
| `backend/requirements.txt` | Docker build 前に失敗する依存名を修正した |
| `README.md` | `DATABASE_URL` と `NEXT_PUBLIC_API_BASE_URL` の責務を仕様として整理した |
| `ELPLANATION/EXPLANATION_STEP11.md` | Docker化前にそろえる前提、確認内容、コードレベル説明を記録した |
| `LEARNING_PROGRESS.md` | Step 11の進捗、理解内容、確認結果を記録した |

## なぜ必要か

Docker化では、今までローカルPC上で暗黙に動いていた前提が `Dockerfile` や Compose の設定に明示的に表れます。
この前提があいまいなままコンテナ化を始めると、「依存関係の install が失敗する」「コンテナ内から DB に届かない」「ブラウザから API を引けない」といった問題が同時に出て、原因切り分けが難しくなります。

そのため Step 11では、まず build と起動を止める可能性がある点を先に見つけて、次のStepで Docker 化に集中できる状態へ整えます。

## 保証できること

- backend の依存関係ファイルに Docker build を止める明確な誤りが残っていない
- `DATABASE_URL` が backend と Alembic で共通利用されることを説明できる
- `NEXT_PUBLIC_API_BASE_URL` がブラウザ視点のURLであることを説明できる
- ローカル直接実行の `localhost` と、将来の Compose 内サービス名の違いを説明できる

## 保証できないこと

- backend / frontend / db の Docker コンテナが実際に起動できること
- `docker compose up` 後の疎通確認
- Docker 上での Alembic migration 実行
- Docker 上での Playwright E2E確認

## コードレベル説明

### `backend/requirements.txt`

```text
pytest==9.0.2
httpx==0.28.1
```

このファイルは backend の依存関係一覧です。

- 入口: `pip install -r requirements.txt` や将来の Docker build 中の `pip install`
- 引数: `requirements.txt` に並んだ各依存名とバージョン
- 戻り値: backend 実行とテストに必要な Python パッケージが仮想環境やイメージへ入る
- 異常系: 存在しない依存名があると install が途中で止まり、コンテナ build も失敗する
- 今回の変更: `httpx2==2.0.0` を `httpx==0.28.1` へ修正した

この修正が必要だった理由は、`httpx2` という依存名では Docker 化で `pip install -r requirements.txt` が失敗するためです。

### `backend/app/database.py`

```python
def get_database_url() -> str:
    database_url = getenv("DATABASE_URL")
    if database_url is None or database_url == "":
        raise RuntimeError("DATABASE_URL is not set")
    return database_url
```

このコードでは、backend のDB接続文字列を `DATABASE_URL` から必ず取得します。

- 入口: FastAPI のDB接続生成や Alembic 設定
- 引数: 環境変数 `DATABASE_URL`
- 戻り値: SQLAlchemy / Alembic が使う接続文字列
- 例外: 未設定または空文字なら `RuntimeError`
- 呼び出し先: DB engine 生成処理、Alembic の設定

このコードから分かるのは、Docker化で接続先が変わっても「backend 側は `DATABASE_URL` だけを見ればよい」という責務分離です。

### `backend/alembic/env.py`

```python
config.set_main_option("sqlalchemy.url", get_database_url())
```

このコードは Alembic が backend と同じ `DATABASE_URL` を使うことを保証します。

- 入口: `alembic upgrade head` などの migration 実行
- 引数: `get_database_url()` の戻り値
- 戻り値: Alembic の接続先設定
- 正常系: アプリと migration が同じDBを向く
- 異常系: 環境変数が誤っていれば migration も同じく失敗する

### `frontend/lib/api.ts`

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
```

このコードは frontend が呼び出す API の公開URLを決めています。

- 入口: `fetchBooks()`、`fetchBook()`、`createBook()`、`updateBook()`、`deleteBook()`
- 引数: 環境変数 `NEXT_PUBLIC_API_BASE_URL`
- state: `API_BASE_URL` をモジュール読み込み時に決定する
- 戻り値: 各API関数が参照するベースURL
- 正常系: ブラウザから到達できる FastAPI の公開URLへ送信する
- 異常系: ブラウザから名前解決できないURLを設定すると、全API呼び出しが接続失敗になる

初学者が混乱しやすい点は、frontend がコンテナ内で動いていても、この値を実際に使うのはブラウザ側だということです。

### `README.md`

```md
`DATABASE_URL` は FastAPI本体とAlembicが共通で利用する接続文字列です。
`NEXT_PUBLIC_API_BASE_URL` はブラウザが参照するAPIの公開URLです。
```

README には操作手順ではなく、将来の Docker 化でも維持する仕様上の責務を追記しました。

## 起動条件の整理

### backend

- Python依存関係が `requirements.txt` から install できること
- `DATABASE_URL` が設定されていること
- `uvicorn app.main:app --reload` で起動できること
- Alembic も同じ `DATABASE_URL` を使うこと

### frontend

- Node.js依存関係が `package-lock.json` から再現できること
- `NEXT_PUBLIC_API_BASE_URL` が未設定時は `http://localhost:8000` を使うこと
- `npm run dev` / `npm run build` が通ること

### URLの見え方

| 視点 | 使うべきURLの考え方 |
| --- | --- |
| ブラウザ | `http://localhost:8000` のような公開URL |
| backend コンテナ自身 | `localhost` は自分自身を指す |
| frontend コンテナから backend へ内部通信する場合 | 将来はサービス名 `backend` を使う可能性がある |
| backend から DB へ接続する場合 | 将来はサービス名 `db` を使う可能性がある |

## 動作確認で利用したコマンド

### backend依存関係のテスト実行

目的: `requirements.txt` 修正後も backend のAPIテストが通ることを確認する。

実行ディレクトリ: `backend`

```powershell
.\.venv\Scripts\python.exe -m pytest
```

### backendの構文確認

目的: backend の主要コードとテストコードにPython構文エラーがないことを確認する。

実行ディレクトリ: `backend`

```powershell
.\.venv\Scripts\python.exe -m compileall app tests
```

### frontendのlint確認

目的: frontend の静的解析が成功することを確認する。

実行ディレクトリ: `frontend`

```powershell
npm run lint
```

### frontendのbuild確認

目的: frontend が本番ビルドでき、Docker化前提で残っている構文・型エラーがないことを確認する。

実行ディレクトリ: `frontend`

```powershell
npm run build
```

## Playwrightについて

Step 11では画面仕様の変更や挙動変更を行っていないため、Playwrightによる新規E2E確認は実施していません。
このStepの確認対象は、Docker 化前提の整理と build / test を止める要因の除去です。

## 初学者が読む順番

1. `README.md` の環境変数セクションを読む
2. `backend/app/database.py` で `DATABASE_URL` の必須性を確認する
3. `backend/alembic/env.py` で migration も同じ接続先を使うことを確認する
4. `frontend/lib/api.ts` で `NEXT_PUBLIC_API_BASE_URL` の使われ方を確認する
5. `backend/requirements.txt` を見て、Docker build 前に依存解決の誤りがないか確認する
