# バックエンド技術ガイド

Python / FastAPI / SQLAlchemy / Pydantic / Alembic

---

## 1. Python 基礎

### 型ヒント（Type Hints）

Python は本来「型を書かなくてもいい」言語ですが、型ヒントを書くことで  
エディタが補完・エラー検出してくれるようになります。

```python
# 型ヒントなし
def greet(name):
    return "Hello, " + name

# 型ヒントあり（引数の型 → 戻り値の型）
def greet(name: str) -> str:
    return "Hello, " + name
```

**このプロジェクトでの例**（`repositories/book.py`）:
```python
def get_book_by_id(db: Session, book_id: int) -> Book | None:
    return db.get(Book, book_id)
```
- `db: Session` → db は SQLAlchemy の Session 型
- `book_id: int` → 整数
- `-> Book | None` → Book オブジェクト か None を返す（`|` は「または」）

---

### デコレータ（`@` 記号）

関数の前に `@何か` と書くと、その関数に機能を追加できます。

```python
# デコレータの仕組みのイメージ
@classmethod          # "この関数はクラスメソッドです" と宣言
@field_validator(...)  # "この関数はバリデーターです" と宣言
def some_method(cls, value):
    ...
```

**このプロジェクトでの例**（`schemas/book.py`）:
```python
@field_validator("title", "author")
@classmethod
def strip_required_text(cls, value: str) -> str:
    stripped_value = value.strip()
    if stripped_value == "":
        raise ValueError("空白だけの入力はできません")
    return stripped_value
```
`@field_validator("title", "author")` → "title と author フィールドに対してこの検証を実行"

---

### ジェネレータと `yield`

`yield` を使うと「途中で一時停止して値を渡し、あとで処理を再開できる」関数が作れます。

```python
# 通常の関数：return で終了
def normal():
    return "終了"

# ジェネレータ：yield で一時停止、finally で後片付け
def generator():
    print("前処理")
    yield "値を渡す"   # ← ここで一時停止
    print("後処理")    # ← 呼び出し元が終わったら再開
```

**このプロジェクトでの例**（`database.py`）:
```python
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()   # DBセッションを作る
    try:
        yield db          # ← ここでルーター関数に db を渡す
    finally:
        db.close()        # ← ルーター関数が終わったら必ず閉じる
```
`try/finally` の組み合わせで「エラーが起きても必ず閉じる」が保証されます。

---

### 例外（Exception）

エラーが起きたら `raise` で投げ、`try/except` で受け取ります。

```python
class BookNotFoundError(Exception):  # 独自例外クラスの定義
    pass

def get_book(db, book_id):
    book = db.get(Book, book_id)
    if book is None:
        raise BookNotFoundError()   # 例外を投げる
    return book

# 呼び出し側
try:
    book = get_book(db, 999)
except BookNotFoundError:
    print("本が見つかりません")
```

---

## 2. FastAPI

### FastAPI とは

Python で REST API を作るためのフレームワーク。  
「型ヒントを書くと自動でバリデーション・ドキュメント生成してくれる」のが特徴。

---

### ルーティング（URLとの対応付け）

```python
router = APIRouter(prefix="/api/books", tags=["books"])

@router.get("")               # GET /api/books
def list_books_endpoint(...):
    ...

@router.get("/{book_id}")     # GET /api/books/123  ← {book_id} は変数
def get_book_endpoint(book_id: int, ...):  # book_id: int → 自動でint変換
    ...

@router.post("")              # POST /api/books
def create_book_endpoint(...):
    ...
```

`prefix="/api/books"` を設定しているので、`@router.get("")` は `/api/books` になります。

---

### リクエストボディの受け取り

POST/PUT のリクエストボディは Pydantic モデルを引数に書くだけで受け取れます。

```python
@router.post("", response_model=BookResponse, status_code=201)
def create_book_endpoint(
    book_create: BookCreate,   # ← JSON ボディを自動でパース・バリデーション
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_user),
) -> Book:
    ...
```

---

### Depends（依存性注入）

`Depends(関数)` と書くと、FastAPI がその関数を自動で呼び出して値をセットしてくれます。

```python
# Depends なし（自分で毎回書く場合）
def create_book_endpoint(book_create: BookCreate):
    db = SessionLocal()
    try:
        # 処理
    finally:
        db.close()

# Depends あり（FastAPI が db を自動で準備・後片付けしてくれる）
def create_book_endpoint(
    book_create: BookCreate,
    db: Session = Depends(get_db),  # ← get_db() を自動で呼んでくれる
):
    # db はすでに用意されている
    ...
```

Depends は連鎖させることもできます。

```python
def get_current_user(db: Session = Depends(get_db)):
    # db を使って認証処理
    ...

def require_admin_user(current_user: User = Depends(get_current_user)):
    # get_current_user の結果を使って管理者チェック
    ...

# エンドポイントでは require_admin_user だけ書けば OK
def create_book_endpoint(current_user: User = Depends(require_admin_user)):
    ...
```

---

### HTTPステータスコード

```python
from fastapi import status

@router.post("", status_code=status.HTTP_201_CREATED)  # 成功時は 201
@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)  # 削除成功は 204
```

| コード | 意味 |
|--------|------|
| 200 | OK（デフォルト） |
| 201 | Created（作成成功） |
| 204 | No Content（削除成功など、返すデータなし） |
| 401 | Unauthorized（未ログイン） |
| 403 | Forbidden（権限なし） |
| 404 | Not Found |
| 409 | Conflict（重複など） |
| 422 | Unprocessable Entity（バリデーションエラー） |

---

### エラーハンドラー

アプリ全体の例外を種類別に処理します（`main.py`）:

```python
@app.exception_handler(AppError)          # 独自エラー → そのまま返す
@app.exception_handler(StarletteHTTPException)  # HTTPエラー → 整形して返す
@app.exception_handler(RequestValidationError)  # バリデーションエラー → 422
@app.exception_handler(Exception)         # 上記以外すべて → 500
```

---

## 3. SQLAlchemy

### SQLAlchemy とは

Python のコードで SQL を書かずにデータベース操作できるライブラリ（ORM）。  
ORM = Object Relational Mapper：Pythonクラス ↔ DBテーブルを対応付ける。

```
Python クラス (Book) ←→ SQLAlchemy ←→ DB テーブル (books)
```

---

### モデル定義

```python
class Book(Base):
    __tablename__ = "books"   # テーブル名

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    isbn: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
```

| Python の型ヒント | DB の制約 | 意味 |
|---|---|---|
| `Mapped[int]` | `nullable=False` | 必須の整数 |
| `Mapped[str \| None]` | `nullable=True` | NULL を許容する文字列 |
| `primary_key=True` | PRIMARY KEY | ID列 |
| `unique=True` | UNIQUE | 重複不可 |

---

### データの取得

```python
# 主キー（id）で1件取得 → Book か None
book = db.get(Book, book_id)

# 条件を指定して検索
from sqlalchemy import select
statement = select(Book).where(Book.isbn == isbn)
book = db.scalars(statement).first()   # 最初の1件（なければ None）

# 全件取得
statement = select(Book).order_by(Book.id)
books = list(db.scalars(statement).all())
```

---

### データの追加・更新・削除

```python
# 追加
book = Book(title="Python入門", author="山田太郎", ...)
db.add(book)
db.flush()   # DB に送る（まだ確定ではない）

# 更新（オブジェクトのプロパティを変更するだけで OK）
book.title = "新しいタイトル"
db.flush()

# 削除
db.delete(book)
db.flush()

# 最後に commit で確定
db.commit()
```

**flush と commit の違い**:
- `flush()` → DB に SQL を送るが、まだロールバックできる（一時的）
- `commit()` → 変更を完全に確定する（取り消し不可）

このプロジェクトでは repository が `flush()`、service が `commit()` を担当しています。

---

### DB接続の設定（`database.py`）

```python
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False)
```

- `pool_pre_ping=True` → 接続前に生きているか確認（Docker 起動時のタイムラグ対策）
- `autocommit=False` → 手動で commit するまで確定しない
- `autoflush=False` → 手動で flush するまで DB に送らない

---

## 4. Pydantic

### Pydantic とは

「受け取ったデータが正しい形かチェックする」ライブラリ。  
FastAPI はリクエストのバリデーションに Pydantic を使っています。

---

### BaseModel でスキーマ定義

```python
from pydantic import BaseModel, Field

class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)    # 1文字以上255文字以下
    author: str = Field(min_length=1, max_length=255)
    published_year: int | None = Field(default=None, ge=1)  # None か1以上の整数
    isbn: str | None = Field(default=None, max_length=20)
```

| Field オプション | 意味 |
|---|---|
| `min_length=1` | 最低1文字 |
| `max_length=255` | 最大255文字 |
| `ge=1` | 1以上（Greater than or Equal） |
| `default=None` | 省略したときの値 |

---

### field_validator でカスタム検証

```python
@field_validator("title", "author")
@classmethod
def strip_required_text(cls, value: str) -> str:
    stripped_value = value.strip()        # 前後の空白を除去
    if stripped_value == "":
        raise ValueError("空白だけの入力はできません")  # エラーを投げる
    return stripped_value                 # 変換後の値を返す
```

`mode="before"` を付けると型チェックの前に実行されます：

```python
@field_validator("isbn", mode="before")  # str に変換する前に実行
@classmethod
def normalize_isbn(cls, value: Any) -> Any:
    if isinstance(value, str):
        stripped = value.strip()
        if stripped == "":
            return None   # 空文字を None に変換
        return stripped
    return value
```

---

### from_attributes（ORM オブジェクトをそのまま変換）

```python
class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # ← これが重要
    id: int
    title: str
    ...
```

`from_attributes=True` がないと、SQLAlchemy が返す `Book` オブジェクトを  
Pydantic モデルに変換できません（辞書型しか受け付けない）。

---

## 5. Alembic

### Alembic とは

データベースのテーブル構造を「バージョン管理」するツール。  
Git がコードをバージョン管理するように、Alembic は DB のスキーマをバージョン管理します。

---

### なぜ必要か

開発中にテーブル構造は何度も変わります。

```
Step1: books テーブル作成
Step2: isbn カラム追加
Step3: published_year カラム追加
Step4: audit_logs テーブル追加
```

Alembic はこれを「マイグレーションファイル」として記録し、  
`alembic upgrade head` 一発で最新状態まで適用できます。

---

### 使い方

```bash
# マイグレーションファイルの作成（モデルとの差分を自動検出）
alembic revision --autogenerate -m "add isbn column"

# 最新まで適用
alembic upgrade head

# 1つ前に戻す
alembic downgrade -1
```

Docker Compose の起動コマンドにも含まれています：
```yaml
command: ["sh", "-c", "alembic upgrade head && uvicorn app.main:app ..."]
```
→ コンテナ起動のたびに自動でマイグレーションを適用します。
