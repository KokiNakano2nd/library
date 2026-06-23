# Step 1: PostgreSQLとの接続

## このStepで行うこと

FastAPIからPostgreSQLへ接続するための土台を作ります。

- `DATABASE_URL` を環境変数として扱う
- SQLAlchemyでDB接続を作る
- リクエストごとに使うDBセッションを用意する
- Alembicでマイグレーションを実行できる構成を作る

## データベース接続文字列

バックエンドでは次の形式の環境変数を使います。

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/library
```

実際の値は `backend/.env` に記載します。`backend/.env.example` は設定例です。

## ファイルの役割

| ファイル | 役割 |
| --- | --- |
| `backend/app/database.py` | DB接続、SQLAlchemyのBase、DBセッション管理 |
| `backend/alembic.ini` | Alembicの基本設定 |
| `backend/alembic/env.py` | Alembic実行時にDB接続とモデル情報を読み込む |
| `backend/.env.example` | 環境変数の設定例 |

## 接続確認

PostgreSQLに `library` データベースを作成し、`backend/.env` を設定した後、バックエンドディレクトリで次を実行します。

```powershell
python -c "from app.database import check_database_connection; print(check_database_connection())"
```

`True` が表示されれば、FastAPI側のDB接続設定からPostgreSQLへ接続できています。

プロジェクト直下から実行する場合も、バックエンドを開発用パッケージとして登録済みなので次で確認できます。

```powershell
backend\.venv\Scripts\python.exe -c "from app.database import check_database_connection; print(check_database_connection())"
```

Alembicが設定を読めるかは次で確認します。

```powershell
alembic current
```

Step 1ではまだテーブルを作成しません。`books` テーブルの作成はStep 2で行います。

## 今回のローカル環境で確認したこと

PostgreSQL 17をWindowsへインストールし、サービス `postgresql-x64-17` が起動していることを確認しました。

また、プロジェクト直下から `app.database` を読み込めるように、`backend/setup.py` を追加し、仮想環境へ editable install しました。

`psql` がPATHに反映されていない場合は、次のように直接指定できます。

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -p 5432 -d library -c "SELECT current_database();"
```

今回の接続文字列は次の形式です。

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/library
```

## 実装部分のコードレベル説明

### `backend/app/database.py`

```python
def get_database_url() -> str:
    database_url = getenv("DATABASE_URL")
    if database_url is None or database_url == "":
        raise RuntimeError("DATABASE_URL is not set")
    return database_url

engine: Engine = create_engine(get_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

このStepの中心は、FastAPIからPostgreSQLへ接続するための共通コードです。

`load_dotenv(Path(__file__).resolve().parents[1] / ".env")` は、`backend/.env` を読み込みます。
これにより、以降の `getenv("DATABASE_URL")` でデータベース接続文字列を取得できます。

`Base` はSQLAlchemyのモデル定義の土台です。
Step 2以降で作る `Book` モデルはこの `Base` を継承するため、AlembicやSQLAlchemyが「どのテーブル定義を管理対象にするか」を追えるようになります。

`get_database_url()` は `DATABASE_URL` を返す関数です。
値が未設定または空文字の場合は `RuntimeError` を発生させます。
この分岐があることで、接続先がないままアプリを起動して別の場所で分かりにくいDBエラーになることを防ぎます。

`engine = create_engine(get_database_url(), pool_pre_ping=True)` はDB接続の入口を作ります。
`pool_pre_ping=True` は、古くなった接続を使う前に接続確認を行う設定です。

`SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)` はDB操作用のセッションを作る工場です。
`autocommit=False` なので、登録・更新・削除は明示的に `commit()` するまで確定しません。

`get_db()` はFastAPIの `Depends(get_db)` から呼ばれる想定の関数です。
最初に `SessionLocal()` でセッションを作り、`yield db` でAPI処理へ渡します。
API処理が終わると `finally` の `db.close()` が必ず実行され、DB接続が閉じられます。

`check_database_connection()` は接続確認用です。
`engine.connect()` でDBへ接続し、`SELECT 1` を実行します。
例外が出なければ `True` を返すため、「接続文字列」「PostgreSQL起動」「DB存在」の基本確認に使えます。

### `backend/alembic/env.py`

```python
config.set_main_option("sqlalchemy.url", get_database_url())
target_metadata = Base.metadata
```

`config.set_main_option("sqlalchemy.url", get_database_url())` により、Alembicもアプリと同じ `DATABASE_URL` を使います。
この行がないと、Alembicの設定ファイル側に固定された接続先を見てしまい、アプリとマイグレーションの接続先がずれる可能性があります。

`target_metadata = Base.metadata` は、Alembicが比較対象にするSQLAlchemyモデル情報です。
Step 2以降でモデルを追加すると、Alembicはこの `metadata` を見てDBとの差分を検出します。

初学者が読む順番は、`get_database_url()`、`engine`、`SessionLocal`、`get_db()`、`alembic/env.py` の `target_metadata` です。
