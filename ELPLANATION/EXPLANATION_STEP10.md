# Step 10: Docker 化の計画

## この Step の目的

この Step では、現在ローカル PC 上で直接実行している開発環境を、Docker Compose を使って再現できる形へ移行するための計画を整理する。  
まだ実装は行わず、何をどの順番で変更するか、どこに注意点があるかを明確にする。

今回の対象は次の 3 つである。

- `frontend`: Next.js
- `backend`: FastAPI
- `database`: PostgreSQL

最終的には、開発者がローカル PC の Python や Node.js の差分にあまり依存せず、`docker compose` を使って同じ開発環境を起動できる状態を目指す。

## 現状整理

現在のコードから読み取れる前提は次のとおり。

### `backend/app/database.py`

```python
def get_database_url() -> str:
    database_url = getenv("DATABASE_URL")
    if database_url is None or database_url == "":
        raise RuntimeError("DATABASE_URL is not set")
    return database_url
```

このコードでは、backend は `DATABASE_URL` が必須であることを前提にしている。  
そのため Docker 化では、コンテナ起動時に `DATABASE_URL` を必ず注入する必要がある。

### `frontend/lib/api.ts`

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
```

このコードでは、frontend は `NEXT_PUBLIC_API_BASE_URL` で API の接続先を切り替える構成になっている。  
Docker 化後も、ブラウザから見える API の URL をどうするかを明確にしておく必要がある。

### `backend/alembic/env.py`

```python
config.set_main_option("sqlalchemy.url", get_database_url())
```

Alembic も backend と同じ `DATABASE_URL` を参照している。  
そのため、Docker 化では「アプリ起動」と「migration 実行」の両方で同じ DB 接続設定を使えるようにそろえる必要がある。

## 採用する方針

最初の Docker 化では、構成を複雑にしすぎないことを優先する。  
本番向け最適化より、ローカル開発での再現性と理解しやすさを優先する。

採用方針は次のとおり。

1. `docker-compose.yml` で `frontend` `backend` `db` の 3 サービスを管理する
2. 開発用の構成として、各サービスを個別コンテナで起動する
3. DB データは named volume で永続化する
4. backend と frontend は Dockerfile を分けて作る
5. migration は Alembic を使い続ける
6. Playwright による挙動確認は Docker 起動後の URL に対して実施する

## 実装計画

### 1. 起動条件と責務を固定する

最初に、Docker 化後も各層の責務を変えないように整理する。

- frontend は引き続きブラウザ向け UI を提供する
- backend は REST API を提供する
- PostgreSQL は永続データを保持する
- Alembic は DB スキーマの変更を管理する

この整理を先に行う理由は、Docker を入れること自体が目的ではなく、既存のアプリ構造を壊さずに実行基盤だけを切り替えることが目的だからである。

### 2. backend 用 Dockerfile を作成する

backend では、少なくとも次を満たす Dockerfile を作る。

- Python 実行環境を用意する
- `requirements.txt` を使って依存関係をインストールする
- `uvicorn` で `0.0.0.0:8000` を待ち受ける
- コンテナ内で Alembic を実行できるようにする

ここで重要なのは、ローカルの `127.0.0.1` 待受ではなく、コンテナ外から到達できる `0.0.0.0` 待受にすることである。

### 3. frontend 用 Dockerfile を作成する

frontend では、少なくとも次を満たす Dockerfile を作る。

- Node.js 実行環境を用意する
- `package-lock.json` を利用して依存関係を再現する
- `next dev --hostname 0.0.0.0 --port 3000` で開発起動できるようにする

開発中はホットリロードを維持したいため、初回は開発用コンテナ構成を優先する。  
本番向けの multi-stage build は、そのあとで必要に応じて分けて考える。

### 4. `docker-compose.yml` を追加する

Compose では次の 3 サービスを定義する。

- `frontend`
- `backend`
- `db`

想定する責務は次のとおり。

| サービス名 | 主な役割 | 公開ポート |
| --- | --- | --- |
| `frontend` | Next.js の画面提供 | `3000:3000` |
| `backend` | FastAPI の API 提供 | `8000:8000` |
| `db` | PostgreSQL | `5432:5432` |

さらに次の設定を入れる計画とする。

- `depends_on`
- `environment`
- `volumes`
- `ports`
- `healthcheck`

特に `db` の healthcheck を定義しておくと、backend が DB 起動前に接続して失敗する可能性を減らしやすい。

### 5. 環境変数を Docker 前提で見直す

現状のサンプル値はローカル直接実行前提になっている。

#### `backend/.env.example`

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/library
```

Docker Compose では `localhost` ではなく、通常はサービス名 `db` を使う。

```env
DATABASE_URL=postgresql+psycopg://postgres:password@db:5432/library
```

この差分を README と説明ファイルで明確にしておかないと、コンテナ内から `localhost` を見たときに「自分自身」を指してしまい、DB に接続できなくなる。

#### `frontend/.env.local.example`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

frontend については、ブラウザからアクセスする URL を考える必要がある。  
ユーザーがブラウザで `http://localhost:3000` を開く構成なら、API も `http://localhost:8000` のままでよい可能性が高い。

ただし、Next.js の実行場所はコンテナ内でも、`NEXT_PUBLIC_` 系の値は最終的にブラウザで使われるため、backend コンテナ名 `http://backend:8000` をそのまま入れる設計にはしない。

### 6. migration 実行手順を Docker 前提に整理する

DB 初期化は Alembic を継続利用する。

想定コマンド例は次のとおり。

```powershell
docker compose exec backend alembic upgrade head
```

この運用により、スキーマ変更の管理方法は現状のまま維持できる。  
初回実装では「backend 起動時に自動 migration」までは入れず、まずは手動コマンドで確実に流せる状態を作る方が安全である。

### 7. CORS と接続経路を明確にする

現在の backend には localhost 向けの CORS 設定がある。

```python
allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3011",
    "http://127.0.0.1:3011",
]
```

Docker 化後も、ブラウザのアクセス元が `http://localhost:3000` である限り、この方針は大きく変えなくてよい。  
ただし、今後 `frontend` のポートや E2E 用ポートが増える場合は、CORS の許可元を整理し直す必要がある。

### 8. テスト手順を Docker 前提に更新する

プロジェクト規約上、挙動確認を行う場合は Playwright を実施する必要がある。

そのため Docker 化後の確認では、少なくとも次を行う。

1. `docker compose up` で各サービスを起動する
2. backend の `/health` を確認する
3. frontend の `/books` を確認する
4. Playwright を実行する
5. `test/evidence` に証跡を保存する

Docker 化で重要なのは「起動した」ことではなく、「既存の画面遷移と CRUD が壊れていない」ことを確認する点である。

### 9. ドキュメントを更新する

実装時には、次のドキュメント更新が必要になる。

- `README.md`
- `ELPLANATION/EXPLANATION_STEP10.md` または実装 Step の説明ファイル
- `LEARNING_PROGRESS.md`

役割分担は次のとおり。

| ファイル | 更新内容 |
| --- | --- |
| `README.md` | 実行基盤が Docker Compose 前提になったことを仕様として反映する |
| `ELPLANATION/EXPLANATION_STEP{番号}.md` | 操作手順、起動手順、コードレベル説明、確認コマンド、Playwright 証跡を記載する |
| `LEARNING_PROGRESS.md` | Docker 化 Step の進捗、理解度、日付、コミットを更新する |

## 先に確認しておくべき論点

### 1. `backend/requirements.txt` の依存名

現在の `requirements.txt` には次の行がある。

```text
httpx2==2.0.0
```

これは依存名の誤りである可能性が高い。  
Docker build では依存インストールが最初に厳密に失敗しやすいため、この点は実装前に確認対象に含める。

### 2. `.env` の読み込み方式

backend では `.env` を読み込む実装が入っている。

```python
load_dotenv(Path(__file__).resolve().parents[1] / ".env")
```

Docker Compose では、ファイルから読む方法と `environment` で注入する方法が混在しやすい。  
そのため、最終的にどちらを正とするかをそろえておかないと、開発者ごとに設定元がずれて混乱しやすい。

### 3. ブラウザ視点とコンテナ視点の URL の違い

Docker 化で最も混乱しやすい点は、同じ backend でも見る主体によって URL が変わることである。

| 視点 | backend の見え方の例 |
| --- | --- |
| ブラウザ | `http://localhost:8000` |
| backend コンテナ自身 | `http://localhost:8000` は自分自身 |
| frontend コンテナから backend | `http://backend:8000` |

この違いを理解しないまま実装すると、frontend の環境変数に `backend:8000` を入れてしまい、ブラウザから名前解決できずに失敗する可能性がある。

## 実装順序の提案

Docker 化の実装は、次の順序で進めるのが安全である。

1. `backend/requirements.txt` など、build を止める要因を先に確認する
2. `backend/Dockerfile` を作る
3. `frontend/Dockerfile` を作る
4. `docker-compose.yml` を作る
5. `.env` サンプルを見直す
6. `docker compose up` で起動確認する
7. Alembic migration を流す
8. `/health` と `/books` を確認する
9. Playwright を実施する
10. README と説明ファイル、進捗ファイルを更新する

## この Step でまだ実施しないこと

今回の計画作成では、次の作業はまだ実施しない。

- 実際の `Dockerfile` 作成
- `docker-compose.yml` 作成
- Docker 上での起動確認
- Playwright 実行
- README 更新
- `LEARNING_PROGRESS.md` 更新

これらは次の実装 Step で行う。

## まとめ

今回の Docker 化では、Next.js / FastAPI / PostgreSQL を 3 コンテナに分け、`docker compose` で開発環境を再現できるようにする方針を採る。  
実装時の主な論点は、`DATABASE_URL`、`NEXT_PUBLIC_API_BASE_URL`、Alembic migration、CORS、そして Playwright による挙動確認である。  
まずは開発用としてシンプルな構成を作り、起動再現性と理解しやすさを優先して進める。
