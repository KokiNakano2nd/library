# Step 12: backend のコンテナ化

## このStepの目的

Step 12では、FastAPI backend を Docker コンテナ内で起動できるようにし、ローカル Python 環境へ依存しない実行方法を追加しました。

今回の主な到達点は次の3つです。

- `backend/Dockerfile` から backend イメージを build できる
- `uvicorn` をコンテナ内で `0.0.0.0:8000` で待ち受けできる
- `alembic.ini`、`alembic/`、`app/` を含んだイメージになり、コンテナ内で Alembic を実行できる前提を作る

## 追加・変更したファイル

| ファイル | 役割 |
| --- | --- |
| `backend/Dockerfile` | backend イメージの作成手順と起動コマンドを定義した |
| `backend/.dockerignore` | 不要なローカルファイルを build context から除外した |
| `README.md` | backend 単体コンテナ実行時の `DATABASE_URL` の考え方を仕様へ反映した |
| `ELPLANATION/EXPLANATION_STEP12.md` | このStepの実装理由、コードレベル説明、確認コマンドを記録した |
| `LEARNING_PROGRESS.md` | Step 12の進捗と理解内容を記録した |
| `LEARNING_ROADMAP.md` | Step 11 / Step 12の完了状態を更新した |

## なぜ必要か

これまでの backend は、ローカルPC上の Python 仮想環境を前提に起動していました。
この状態では、別のPCや将来の Docker Compose 環境で「どの Python を使うか」「どの依存関係を入れるか」「どのコマンドで起動するか」が暗黙的になりやすくなります。

そこで Step 12では、backend を動かすための前提を `Dockerfile` に明示し、少なくとも FastAPI を単体コンテナとして build / 起動できる状態を作りました。

## 保証できること

- `docker build` で backend イメージを作成できる
- `docker run -p 8000:8000` で FastAPI を公開できる
- `GET /health` がコンテナ経由で `200 OK` を返す
- イメージ内に Alembic 実行に必要なファイルが含まれている

## 保証できないこと

- frontend / database を含めた Compose 全体起動
- コンテナ化した backend から PostgreSQL へ正常接続できること
- Docker 環境上での books CRUD 疎通確認
- Docker 環境上での Playwright E2E確認

## コードレベル説明

### `backend/Dockerfile`

```dockerfile
FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

このファイルは、backend コンテナの作り方と起動方法の入口です。

- 入口: `docker build` と `docker run`
- 引数: build context に含まれる `requirements.txt`、`app/`、`alembic/`、`alembic.ini` など
- 戻り値: FastAPI と Alembic を含む backend イメージ
- state: 作業ディレクトリを `/app` に固定し、以後の `COPY` と起動コマンドの基準にする
- 内部処理の順番:
  1. `python:3.13-slim` をベースにする
  2. `WORKDIR /app` でコンテナ内の作業場所を決める
  3. `requirements.txt` だけを先にコピーする
  4. `pip install` で依存関係を入れる
  5. backend のソースコード一式をコピーする
  6. `uvicorn` を `0.0.0.0:8000` で起動する
- 正常系: コンテナ外から `localhost:8000` 経由で FastAPI へ到達できる
- 異常系: `--host 0.0.0.0` を付けないと、コンテナ外から疎通できない

初学者が読む順番としては、まず `CMD` を見て「最終的に何が起動するか」を理解し、そのあと `COPY` と `RUN` を上から追うと分かりやすいです。

### `backend/.dockerignore`

```text
.venv/
.pytest_cache/
__pycache__/
*.pyc
uvicorn.out.log
uvicorn.err.log
```

このファイルは、`docker build` に渡す不要ファイルを減らすための設定です。

- 入口: `docker build`
- 引数: build context 配下のファイル一覧
- 戻り値: Docker daemon へ送られるファイル集合が小さくなる
- 正常系: ローカル専用の `.venv` やキャッシュがイメージへ混ざらない
- 異常系: 除外すべきでないファイルを書いてしまうと build や起動に必要なファイルまで消える

今回の設定では、backend 実行に不要な仮想環境、キャッシュ、ログだけを除外しています。

### `backend/app/main.py`

```python
app = FastAPI(title="Library API")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
```

このコードは、Step 12でコンテナ起動確認に使う API の入口です。

- 入口: `uvicorn app.main:app`
- 戻り値: FastAPI アプリケーション
- HTTPステータス: `/health` の正常系は `200 OK`
- 呼び出し順番: コンテナ起動 → `uvicorn` が `app` を import → `/health` リクエストを受ける → JSON を返す
- 正常系: DB未接続でも `/health` は応答できる
- 異常系: import 失敗や起動失敗があるとコンテナが落ちる

Step 12では books API ではなく `/health` を確認対象にすることで、「まずコンテナ起動とHTTP公開ができているか」を小さく切り分けています。

### `backend/app/database.py`

```python
def get_database_url() -> str:
    database_url = getenv("DATABASE_URL")
    if database_url is None or database_url == "":
        raise RuntimeError("DATABASE_URL is not set")
    return database_url
```

このコードは、コンテナ内でも DB 接続先を環境変数から受け取る構成であることを保証します。

- 入口: SQLAlchemy engine 生成、Alembic 設定
- 引数: `DATABASE_URL`
- 戻り値: DB接続文字列
- 例外: 未設定なら `RuntimeError`
- 呼び出し先: `engine = create_engine(...)`、`backend/alembic/env.py`

backend を単体コンテナで動かすときに `DATABASE_URL` のホスト名を `localhost` のままにすると、コンテナ自身を指してしまいます。
そのため、ホストOS上の PostgreSQL を使うなら `host.docker.internal` のような別名が必要です。

### `backend/alembic/env.py`

```python
config.set_main_option("sqlalchemy.url", get_database_url())
```

このコードにより、Alembic もコンテナ内で backend と同じ `DATABASE_URL` を使います。

- 入口: `alembic upgrade head`、`alembic current`
- 引数: `get_database_url()` の戻り値
- 戻り値: Alembic の接続先設定
- 正常系: backend と migration が同じDBを向く
- 異常系: `DATABASE_URL` が誤っていれば migration も失敗する

Step 12で `COPY . .` を入れている理由の1つは、`alembic.ini` と `alembic/` がイメージ内に存在しないと、この処理まで到達できないためです。

### `README.md`

```md
ローカル直接実行では `localhost` を使います。
backend を単体Dockerコンテナで起動し、ホストOS上の PostgreSQL へ接続する場合は、Windows / macOS では `host.docker.internal` を使う前提とします。
```

README には操作手順ではなく、環境変数の役割と URL の見え方の仕様を追記しました。

## 動作確認で利用したコマンド

### backend の Python テスト

目的: Docker 化後も backend の既存APIテストが壊れていないことを確認する。

実行ディレクトリ: `backend`

```powershell
.\.venv\Scripts\python.exe -m pytest
```

### backend イメージの build

目的: `backend/Dockerfile` からイメージを作成できることを確認する。

実行ディレクトリ: `backend`

```powershell
docker build -t library-backend-step12 .
```

### backend コンテナの起動

目的: コンテナ内の `uvicorn` が `0.0.0.0:8000` で待ち受け、ホストから到達できることを確認する。

実行ディレクトリ: `backend`

```powershell
docker run --rm -d -p 8000:8000 --name library-backend-step12 -e DATABASE_URL=postgresql+psycopg://postgres:postgres@host.docker.internal:5432/library library-backend-step12
```

### `/health` の疎通確認

目的: 起動した backend コンテナへ HTTP で到達できることを確認する。

実行ディレクトリ: `backend`

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8000/health
```

### backend コンテナの停止

目的: 動作確認後に Step 12 用コンテナを停止する。

実行ディレクトリ: `backend`

```powershell
docker stop library-backend-step12
```

### コンテナ内 Alembic の確認

目的: イメージ内に Alembic 実行に必要なファイルと依存関係がそろっていることを確認する。

実行ディレクトリ: `backend`

```powershell
docker run --rm -e DATABASE_URL=postgresql+psycopg://postgres:postgres@host.docker.internal:5432/library library-backend-step12 alembic current
```

## Playwrightについて

Step 12では backend の実行基盤だけを追加し、画面仕様や画面遷移は変更していません。
そのため、このStepでは Playwright による新規E2E確認は実施していません。

## 初学者が読む順番

1. `backend/Dockerfile` の `CMD` を見て、何を起動するか把握する
2. 同じ `backend/Dockerfile` の `COPY` と `RUN` を上から追って、build の流れを理解する
3. `backend/.dockerignore` を見て、なぜローカル仮想環境を除外するか確認する
4. `backend/app/main.py` の `/health` を見て、起動確認の入口を理解する
5. `backend/app/database.py` と `backend/alembic/env.py` を見て、DB接続先の受け渡しを確認する
6. `README.md` の環境変数セクションを見て、`localhost` と `host.docker.internal` の使い分けを確認する
