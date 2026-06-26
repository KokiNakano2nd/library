# インフラ技術ガイド

SQL・PostgreSQL / Docker / Docker Compose

---

## 1. SQL と PostgreSQL

### SQL とは

データベースを操作するための言語。  
「SELECT（取得）」「INSERT（追加）」「UPDATE（更新）」「DELETE（削除）」が基本。

---

### 基本的な SQL

**テーブルを作る（CREATE TABLE）**
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,           -- 自動連番のID
    title VARCHAR(255) NOT NULL,     -- 文字列、空不可
    author VARCHAR(255) NOT NULL,
    published_year INTEGER,          -- 整数（NULL可）
    isbn VARCHAR(20) UNIQUE,         -- 重複不可
    created_at TIMESTAMPTZ NOT NULL  -- タイムゾーン付き日時
);
```

**データを取得する（SELECT）**
```sql
-- 全件取得
SELECT * FROM books;

-- 条件を指定
SELECT * FROM books WHERE isbn = '978-4-123456-78-9';

-- 並び替え
SELECT * FROM books ORDER BY id ASC;

-- 1件だけ
SELECT * FROM books WHERE id = 1 LIMIT 1;
```

**データを追加する（INSERT）**
```sql
INSERT INTO books (title, author, published_year, isbn)
VALUES ('Python入門', '山田太郎', 2024, '978-4-123456-78-9');
```

**データを更新する（UPDATE）**
```sql
UPDATE books SET title = '新タイトル' WHERE id = 1;
```

**データを削除する（DELETE）**
```sql
DELETE FROM books WHERE id = 1;
```

---

### PostgreSQL とは

オープンソースのリレーショナルデータベース管理システム（RDBMS）。  
このプロジェクトでは Docker で PostgreSQL 17 を使っています。

**MySQL や SQLite との主な違い**:
- TIMESTAMPTZ（タイムゾーン付き日時）型が使える
- `SERIAL`（自動連番）や `GENERATED ALWAYS AS IDENTITY` が使える
- 本番環境でよく使われる（AWS RDS、Heroku 等でもよく採用）

---

### テーブル設計の基本概念

**主キー（Primary Key）**
```sql
id SERIAL PRIMARY KEY  -- 各行を一意に識別する列
```

**外部キー（Foreign Key）**
```sql
-- audit_logs テーブルが books の id を参照する
book_id INTEGER REFERENCES books(id)
```
これにより「存在しない book_id は入れられない」という整合性が保たれます。

**制約（Constraint）**
```sql
-- このプロジェクトの books テーブルの制約
CONSTRAINT ck_books_published_year_positive
    CHECK (published_year IS NULL OR published_year >= 1)
```
`CHECK` 制約で「1以上か NULL でなければ INSERT/UPDATE を弾く」を DB レベルで保証します。

---

## 2. Docker

### Docker とは

アプリケーションとその実行環境をまとめて「コンテナ」という箱に入れる技術。  
「自分のPCでは動くのに本番では動かない」問題を解消できます。

```
コンテナ = アプリ + OS + ライブラリ + 設定
           → どこでも同じ環境で動く
```

---

### 基本用語

| 用語 | 意味 | 例 |
|---|---|---|
| **イメージ** | コンテナの設計図（テンプレート） | `postgres:17`、`python:3.12` |
| **コンテナ** | イメージを実行したもの（実体） | 動いている PostgreSQL |
| **Dockerfile** | イメージを作る手順書 | `FROM python:3.12` ... |
| **レジストリ** | イメージの配布場所 | Docker Hub |

---

### Dockerfile の読み方

**バックエンドの Dockerfile（概念）**:
```dockerfile
FROM python:3.12-slim          # ベースになるイメージ（Python入りのLinux）

WORKDIR /app                   # 作業ディレクトリを /app に設定

COPY requirements.txt .        # 依存ファイルをコピー
RUN pip install -r requirements.txt  # ライブラリをインストール

COPY . .                       # ソースコードをコピー

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### よく使うコマンド

```bash
# イメージをビルド
docker build -t my-app .

# コンテナを起動
docker run -p 8000:8000 my-app

# 動いているコンテナ一覧
docker ps

# コンテナを停止
docker stop <コンテナID>

# コンテナの中に入る（デバッグ用）
docker exec -it <コンテナID> bash
```

---

## 3. Docker Compose

### Docker Compose とは

複数のコンテナを一括管理するツール。  
`docker-compose.yml` に設定を書いて `docker compose up` で全部起動できます。

このプロジェクトは 3 つのサービスで構成されています：

```
browser → frontend (Next.js :3000)
              ↓
         backend (FastAPI :8000)
              ↓
          db (PostgreSQL :5432)
```

---

### docker-compose.yml の読み方

```yaml
services:
  db:                                    # サービス名
    image: postgres:17                   # 使うイメージ
    container_name: library-db-step14    # コンテナ名
    environment:                         # 環境変数
      POSTGRES_DB: library
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"                      # ホスト:コンテナ のポートマッピング
    volumes:
      - postgres_data:/var/lib/postgresql/data  # データを永続化
    healthcheck:                         # 正常に起動したか確認する方法
      test: ["CMD-SHELL", "pg_isready -U postgres -d library"]
      interval: 5s
      timeout: 5s
      retries: 10
```

---

### depends_on（起動順序の制御）

```yaml
backend:
  depends_on:
    db:
      condition: service_healthy   # db が healthy になってから backend を起動
```

`condition: service_healthy` → healthcheck が成功するまで待つ。  
これがないと DB が起動する前に FastAPI が動き始めて「DB に接続できない」エラーが出ます。

---

### ports（ポートマッピング）

```yaml
ports:
  - "8000:8000"  # ホスト(PC)の8000 → コンテナの8000
  - "5432:5432"  # ホスト(PC)の5432 → コンテナの5432
```

`ホスト:コンテナ` の形式。ブラウザから `localhost:8000` でアクセスすると  
Docker がコンテナの 8000 ポートに転送します。

---

### volumes（データの永続化）

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

コンテナは停止・削除するとデータが消えます。  
`volumes` を使うと DB のデータをホストのディスクに保存できます。

```yaml
volumes:
  postgres_data:   # ← この名前付きボリュームを定義
```

---

### コンテナ間の通信

Docker Compose 内のコンテナはサービス名で互いに通信できます。

```yaml
backend:
  environment:
    DATABASE_URL: postgresql+psycopg://postgres:password@db:5432/library
    #                                                    ^^ サービス名でアクセス
```

`db` がサービス名なので、`@db:5432` と書くだけで PostgreSQL に接続できます。

同様にフロントエンドからバックエンドへは：
```yaml
frontend:
  environment:
    INTERNAL_API_BASE_URL: http://backend:8000  # backend サービスへ
```

---

### よく使うコマンド

```bash
# 全サービスをバックグラウンドで起動
docker compose up -d

# ログを見る
docker compose logs -f backend

# 全サービスを停止
docker compose down

# 停止してボリューム（DBデータ）も削除
docker compose down -v

# 特定サービスだけ再起動
docker compose restart backend

# イメージを再ビルドして起動
docker compose up -d --build
```

---

### 起動コマンドのカスタマイズ

```yaml
backend:
  command:
    - "sh"
    - "-c"
    - "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"
```

Dockerfile の `CMD` を上書きして、起動時に  
1. `alembic upgrade head`（DB マイグレーション）  
2. `uvicorn`（FastAPI サーバー起動）  
の順で実行しています。
