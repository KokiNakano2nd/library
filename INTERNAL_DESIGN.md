# 図書管理システム 内部設計書

SYSTEM_OVERVIEW.md が「何をするか・なぜそうなっているか」を説明するのに対し、
このドキュメントは「コードの中でどう動いているか」を説明します。
関数・クラス・変数レベルの具体的な実装を追える粒度で記述しています。

---

## 目次

1. [リクエストのライフサイクル](#1-リクエストのライフサイクル)
2. [main.py の構造](#2-mainpy-の構造)
3. [database.py のセッション管理](#3-databasepy-のセッション管理)
4. [models の SQLAlchemy 定義](#4-models-の-sqlalchemy-定義)
5. [schemas の Pydantic バリデーション](#5-schemas-の-pydantic-バリデーション)
6. [Depends による依存注入](#6-depends-による依存注入)
7. [services 層のトランザクション境界](#7-services-層のトランザクション境界)
8. [repositories 層の SQLAlchemy 操作](#8-repositories-層の-sqlalchemy-操作)
9. [認証の内部実装](#9-認証の内部実装)
10. [observability の内部実装](#10-observability-の内部実装)
11. [エラーハンドラーの処理順序](#11-エラーハンドラーの処理順序)
12. [フロントエンドの内部実装](#12-フロントエンドの内部実装)
13. [テストの内部構造](#13-テストの内部構造)

---

## 1. リクエストのライフサイクル

`POST /api/books` を例に、コードがどの順番で実行されるか追います。

```
HTTPリクエスト到着
    │
    ▼
CORSMiddleware（FastAPI組み込みミドルウェア）
    │ Originヘッダーを確認してプリフライトに応答する
    │
    ▼
request_logging_middleware（main.py）
    │ assign_request_id()でrequest_idを確定する
    │ started_at = perf_counter() で計測開始
    │ ↓ call_next(request) でルーターへ処理を渡す
    │
    ▼
create_book_endpoint（routers/books.py）
    │ FastAPIがURLとメソッドを照合して関数を特定する
    │ Pydanticが BookCreate でリクエストボディを検証する
    │   → 検証失敗なら RequestValidationError → 422
    │ Depends(get_db) でDBセッションを取得する
    │ Depends(require_admin_user) で認証・認可を確認する
    │   → 未認証なら AuthenticationRequiredError → 401
    │   → admin以外なら AuthorizationError → 403
    │
    ▼
create_book（services/book.py）
    │ ISBNの重複チェック
    │ create_book_repository() でDB書き込み（db.flush()）
    │ record_book_audit_log() で監査ログ書き込み（db.flush()）
    │ db.commit() で2つをまとめてコミット
    │
    ▼
create_book_repository（repositories/book.py）
    │ Book()インスタンスを生成して db.add()
    │ db.flush() でDBに送るが commit はしない
    │
    ▼
BookResponse（schemas/book.py）
    │ Book(SQLAlchemy) → BookResponse(Pydantic) へ変換
    │ JSONにシリアライズして返す
    │
    ▼
request_logging_middleware（main.py に戻る）
    │ attach_request_id_header() でX-Request-IDヘッダーを付与
    │ log_request_completed() でリクエスト完了ログを出力
    │
    ▼
HTTPレスポンス（201 Created）
```

---

## 2. main.py の構造

```python
# アプリ起動時の初期化
@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()   # ロガーの設定（JSON形式で標準出力へ）
    yield                 # ここでアプリが稼働する
                          # yield以降はシャットダウン時の処理（今は何もない）
```

### ミドルウェアとエラーハンドラーの実行順序

FastAPIはミドルウェアを「後に追加したものが外側」として積み上げます。
ただしこのアプリでは `@app.middleware("http")` と `add_middleware()` を混在させており、
実際の実行順序は以下のとおりです。

```
CORSMiddleware（add_middlewareで追加 → 最も外側）
  └── request_logging_middleware（@app.middlewareで追加）
        └── ルーター処理（エラーハンドラーはここで介入）
```

エラーハンドラーは例外の種類ごとに分けられています。

| ハンドラー | 捕捉する例外 | 用途 |
|-----------|-------------|------|
| `app_error_handler` | `AppError` | 業務エラー（401/403/404/409） |
| `http_exception_handler` | `StarletteHTTPException` | FastAPI内部のHTTPエラー（405など） |
| `request_validation_exception_handler` | `RequestValidationError` | Pydanticの入力検証エラー（422） |
| `unhandled_exception_handler` | `Exception` | 想定外のエラー（500） |

`Exception` を最後に置くことで、上記3つで捕捉されなかった全例外をここで受け取ります。
想定外エラーの場合、内部詳細（例外型・メッセージ）はログにだけ残し、
APIレスポンスには固定文言 `"サーバー内部でエラーが発生しました"` を返します。

### CORSの設定

```python
allow_origins=[
    "http://localhost:3000",      # ローカルNext.js
    "http://127.0.0.1:3000",
    "http://localhost:3011",      # Playwright確認用
    "http://127.0.0.1:3011",
    "http://localhost:3012",      # Playwright isolated run用
    "http://127.0.0.1:3012",
],
allow_credentials=True,           # Cookieを含むリクエストを許可
```

`allow_credentials=True` にするとき `allow_origins=["*"]` は使えないのがCORSの仕様です。
ワイルドカードではなく明示的なオリジンのリストが必要なため、このような記述になっています。

---

## 3. database.py のセッション管理

```python
engine = create_engine(get_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
```

- `pool_pre_ping=True`: コネクションプールから取り出すたびに `SELECT 1` でDB疎通を確認する。
  長時間アイドル後の切断から自動復旧できる。
- `autocommit=False`: `db.commit()` を明示的に呼ばないとDBに確定されない。
- `autoflush=False`: `db.flush()` を明示的に呼ぶまでDBに送らない。
  サービス層が複数の書き込みを制御してからまとめてコミットできる。

### DBセッションの依存注入

```python
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db          # ← ここでルーター関数が実行される
    finally:
        db.close()        # ← 成功・失敗に関わらず必ずセッションを閉じる
```

`yield` を使ったジェネレーター関数になっているため、
ルーター関数が終了（または例外が発生）したあとに `finally` が実行されてセッションが閉じられます。

---

## 4. models の SQLAlchemy 定義

### Book モデル

```python
class Book(Base):
    __tablename__ = "books"
    __table_args__ = (
        CheckConstraint(
            "published_year IS NULL OR published_year >= 1",
            name="ck_books_published_year_positive",
        ),
    )
```

`__table_args__` でDBレベルのCHECK制約を定義しています。
Pydanticでも `ge=1` で検証しますが、DBにも制約をかけることで
「APIを通さずに直接DBを操作した場合」でも不正なデータが入らないようにしています。

```python
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    isbn: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
```

`Mapped[str | None]` という型アノテーションで `nullable=True` を表現しています。
SQLAlchemyの型とPythonの型が一致するため、型チェッカー（mypy等）でも安全に扱えます。

### AuditLog モデル

```python
    actor_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )
```

`ForeignKey("users.id")` でDB側の外部キー制約は設定していますが、
`target_id`（本のID）には外部キーを設定していません。
削除された本のIDを参照し続けられるよう、スナップショット設計にしているためです。

---

## 5. schemas の Pydantic バリデーション

### BookCreate の検証ルール

```python
class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author: str = Field(min_length=1, max_length=255)
    published_year: int | None = Field(default=None, ge=1)
    isbn: str | None = Field(default=None, max_length=20)
```

`Field()` で宣言的にバリデーションルールを定義します。

```python
    @field_validator("title", "author")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        stripped_value = value.strip()
        if stripped_value == "":
            raise ValueError("空白だけの入力はできません")
        return stripped_value
```

`Field(min_length=1)` だけでは `" "` (スペースのみ) が通過してしまいます。
`@field_validator` でstrip後に空文字チェックを追加し、空白だけの入力を弾いています。
バリデーション後に stripped_value を返すことで、入力値のトリミングも同時に行っています。

```python
    @field_validator("isbn", mode="before")
    @classmethod
    def normalize_isbn(cls, value: Any) -> Any:
        if isinstance(value, str):
            stripped_value = value.strip()
            if stripped_value == "":
                return None    # 空文字をNULLに正規化
            return stripped_value
        return value
```

`mode="before"` は型変換の前に実行されます。
空文字 `""` が来たとき `None` に変換することで、「ISBN未入力」と「ISBNなし」を統一します。

### BookResponse の from_attributes

```python
class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
```

`from_attributes=True` がないと `BookResponse.model_validate(book_orm_object)` が失敗します。
Pydanticはデフォルトでdictからしかモデルを作れないため、
SQLAlchemyのORMオブジェクト（属性アクセス形式）を受け取れるようにこの設定が必要です。

### LoginRequest の大文字小文字正規化

```python
    @field_validator("login_id")
    @classmethod
    def normalize_login_id(cls, value: str) -> str:
        return value.lower()
```

メールアドレスのログインIDを小文字に正規化します。
`Admin@example.com` と `admin@example.com` を同一として扱うためです。

---

## 6. Depends による依存注入

FastAPIの `Depends` は「引数の解決を自動で行う」機能です。

### ルーターでの使い方

```python
@router.post("")
def create_book_endpoint(
    book_create: BookCreate,                             # リクエストボディ（自動解析）
    db: Session = Depends(get_db),                       # DBセッション（自動生成）
    current_user: User = Depends(require_admin_user),    # 認証・認可（自動実行）
) -> Book:
```

FastAPIはリクエストが来たとき、この引数リストを見て必要な処理を自動実行します。
- `book_create`: JSON ボディを `BookCreate` で解析・検証する
- `db`: `get_db()` を呼んでセッションを得る
- `current_user`: `require_admin_user()` を呼んで認証・認可を確認する

### Depends のチェーン

`require_admin_user` は内部で `get_current_user` に依存しています。

```python
def require_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != ADMIN_ROLE:
        raise AuthorizationError()
    return current_user
```

```
create_book_endpoint
  └── Depends(require_admin_user)
        └── Depends(get_current_user)
              └── Depends(get_db)
```

FastAPIがこの依存ツリーを解析して実行順序を決定します。

### audit_logs エンドポイントの認可専用Depends

```python
def list_audit_logs_endpoint(
    db: Session = Depends(get_db),
    _: object = Depends(require_admin_user),    # 戻り値は使わない
) -> list[AuditLog]:
```

`require_admin_user` の戻り値（Userオブジェクト）は使わず、
「adminであること」を確認するためだけに呼んでいます。
`_` という変数名でその意図を明示しています。

---

## 7. services 層のトランザクション境界

### flush と commit の役割分担

repositories層は `db.flush()` のみを使い、`db.commit()` はservices層が担当します。

```python
# repositories/book.py
def create_book(db, book_create, created_at, updated_at) -> Book:
    book = Book(**book_create.model_dump(), ...)
    db.add(book)
    db.flush()     # DBに送るが確定しない。book.idが採番される
    return book

# services/book.py
def create_book(db, book_create, actor) -> Book:
    # ...
    book = create_book_repository(db, ...)   # flush → book.idが確定
    record_book_audit_log(db, book.id, ...)  # flush → 監査ログがDBに送られる
    db.commit()                              # 両方をまとめて確定
    db.refresh(book)                         # DBから最新状態を取り直す
    return book
```

`db.flush()` 後は `book.id` のような自動採番値が確定するため、
監査ログに `book_id=book.id` として渡せます。
`db.commit()` を1か所で呼ぶことで、本の保存と監査ログが常にセットでコミットされます。

### ロールバックの仕組み

`db.commit()` の前に例外が発生すると、どちらの変更も確定されません。
`get_db()` の `finally` で `db.close()` が呼ばれた時点でセッションがロールバックされます。

```
create_book_repository → db.flush() → 成功
record_book_audit_log  → db.flush() → 例外発生!
    ↓
services層で例外を変換（DuplicateIsbnError 等）
    ↓
routers層でエラーレスポンスを返す
    ↓
get_db() の finally が実行される
    ↓
db.close() → セッションがロールバック → booksもaudit_logsも保存されない
```

### update でのIntegrityError処理

```python
def update_book(db, book_id, book_update, actor) -> Book:
    try:
        updated_book = update_book_repository(...)
        record_book_audit_log(...)
        db.commit()
        return updated_book
    except IntegrityError as error:
        db.rollback()                     # 明示的にロールバック
        raise DuplicateIsbnError() from error
```

`IntegrityError` はDBのUNIQUE制約違反などで発生します。
`db.commit()` 内で起きるため、ここでは明示的に `db.rollback()` を呼んでいます。

---

## 8. repositories 層の SQLAlchemy 操作

### 検索パターン

```python
# 主キーでの取得（最もシンプル）
def get_book_by_id(db: Session, book_id: int) -> Book | None:
    return db.get(Book, book_id)

# 条件指定での取得
def get_book_by_isbn(db: Session, isbn: str) -> Book | None:
    statement = select(Book).where(Book.isbn == isbn)
    return db.scalars(statement).first()

# 自分以外の同ISBNを検索（更新時の重複確認）
def get_other_book_by_isbn(db: Session, isbn: str, book_id: int) -> Book | None:
    statement = select(Book).where(Book.isbn == isbn, Book.id != book_id)
    return db.scalars(statement).first()
```

`db.get()` は主キー検索専用で、SQLAlchemyがセッションキャッシュも利用するため高速です。
それ以外の条件での検索は `select()` を使います。

### 一覧取得

```python
def list_books(db: Session) -> list[Book]:
    statement = select(Book).order_by(Book.id)
    return list(db.scalars(statement).all())
```

`db.scalars()` で結果をPythonの型として取得します。
`.all()` はSQLAlchemyの遅延実行オブジェクトを即時取得するためのメソッドです。
`list()` で変換することで、型アノテーション（`list[Book]`）と一致させています。

### 更新パターン

```python
def update_book(db, book, book_update, updated_at) -> Book:
    update_values = book_update.model_dump()

    for field_name, value in update_values.items():
        setattr(book, field_name, value)   # 属性を上書き

    book.updated_at = updated_at
    db.flush()
    return book
```

SQLAlchemyはオブジェクトの属性変更を追跡（ダーティートラッキング）しています。
`db.add()` を再度呼ぶ必要はなく、属性を変更して `db.flush()` するだけでUPDATEが発行されます。

---

## 9. 認証の内部実装

### パスワードハッシュのフォーマット

`security.py` が生成するパスワードハッシュは以下の形式の文字列です。

```
scrypt$16384$8$1$<Base64エンコードのsalt>$<Base64エンコードのderived_key>
```

各パーツの意味：

| パーツ | 値 | 説明 |
|--------|-----|------|
| `scrypt` | 固定 | アルゴリズム名 |
| `16384` | N=2^14 | CPU・メモリコスト（大きいほど安全・遅い） |
| `8` | r=8 | ブロックサイズ |
| `1` | p=1 | 並列数 |
| `salt` | ランダム16バイト | 同じパスワードでも異なるハッシュになる |
| `derived_key` | 64バイト | 実際の検証に使う鍵 |

照合時は `password_hash` の文字列を `$` で分割して各パラメーターを取り出し、
同じsaltと同じパラメーターで再計算したkey と保存済みkeyを `compare_digest()` で比較します。

### JWT の手動実装

`security.py` はPyJWT等のライブラリを使わず、JWTを自前で実装しています。

```python
def create_access_token(user_id, email, role) -> tuple[str, int]:
    header  = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "iat": issued_at,    # 発行時刻（Unix秒）
        "exp": expires_at,   # 有効期限（issued_at + 1800秒）
    }
    encoded_header  = base64url_encode(json(header))
    encoded_payload = base64url_encode(json(payload))
    signing_input   = f"{encoded_header}.{encoded_payload}"
    signature       = HMAC-SHA256(signing_input, AUTH_SECRET_KEY)
    return f"{signing_input}.{base64url_encode(signature)}"
```

検証時は以下の手順を踏みます。

```
1. トークンを "." で3分割
2. 前2パーツ（header.payload）を signing_input として署名を再計算
3. 再計算した署名と受け取った署名を compare_digest() で比較
   → compare_digest はタイミング攻撃（timing attack）対策
4. ヘッダーの alg/typ が想定と一致するか確認
5. payload の exp が現在時刻を過ぎていないか確認
```

### Cookie の設定

```python
response.set_cookie(
    key="library_access_token",
    value=access_token,
    httponly=True,     # JavaScriptから読めない
    samesite="lax",    # クロスサイトリクエストでは送られない（GETのみ例外）
    secure=False,      # httpsのみ送信する制限をOFF（開発環境のhttp用）
    max_age=1800,      # ブラウザが保持する秒数
    expires=1800,      # 上記と同じ意図（互換性のために両方指定）
)
```

`samesite="lax"` にすることで、他のサイトからのPOST等の「危険なリクエスト」では
Cookieが送られません。CSRF攻撃への基本的な防御になります。

### get_current_user の処理フロー

```python
def get_current_user(
    authorization: str | None = Header(default=None),
    access_token_cookie: str | None = Cookie(default=None, alias=AUTH_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User:
```

`Authorization` ヘッダーと Cookie の2つからトークンを受け取れます。
ヘッダーが優先されますが、ブラウザからの通常操作はCookieが使われます。

```
1. AuthorizationヘッダーにBearer tokenがあればそれを使う
2. なければCookieの library_access_token を使う
3. どちらもなければ AuthenticationRequiredError（401）
4. JWTを検証（署名・有効期限）
5. payloadの "sub"（user_id）でDBからUserを取得
6. user.is_active が False なら 401
7. Userオブジェクトを返す
```

---

## 10. observability の内部実装

### request_id の伝播

```python
def assign_request_id(request: Request) -> str:
    request_id = request.headers.get("X-Request-ID")
    if request_id is None or request_id.strip() == "":
        request_id = uuid4().hex          # 32文字の16進数文字列
    request.state.request_id = request_id # request.stateに保存
    return request_id
```

`request.state` はFastAPIがリクエストごとに持つ名前空間です。
ここに `request_id` を保存することで、同じリクエスト内のどこからでも `get_request_id(request)` で取り出せます。

クライアントが `X-Request-ID` ヘッダーを付けてきた場合はその値を優先します。
これにより「このリクエストIDで調査してほしい」という要望に対応できます。

### ログのフォーマット

```python
def log_event(level: int, event: str, **fields: object) -> None:
    payload = {
        "timestamp": datetime.now(UTC).isoformat(),
        "level": logging.getLevelName(level),
        "event": event,
        **fields,      # 追加フィールドをそのまま展開
    }
    logging.getLogger(LOGGER_NAME).log(
        level,
        json.dumps(payload, ensure_ascii=False, default=str),
    )
```

`ensure_ascii=False` で日本語をそのまま出力します。
`default=str` で `json.dumps` が知らない型（datetimeなど）を文字列変換します。

---

## 11. エラーハンドラーの処理順序

FastAPIのエラーハンドラーが実際にどの順番で試みられるかを示します。

```
例外発生
    │
    ├── AppError のサブクラスか？
    │       YES → app_error_handler
    │             → WARNING ログ出力
    │             → 共通形式JSONレスポンスを返す
    │
    ├── StarletteHTTPException か？
    │       YES → http_exception_handler
    │             → WARNING ログ出力
    │             → 共通形式JSONレスポンスを返す
    │
    ├── RequestValidationError か？
    │       YES → request_validation_exception_handler
    │             → WARNING ログ出力（errors配列含む）
    │             → 422 + errors配列付きレスポンスを返す
    │
    └── それ以外（Exception）
            → unhandled_exception_handler
              → ERROR ログ出力（exception_type, messageを含む）
              → 固定文言の500レスポンス（内部詳細は返さない）
```

### エラーレスポンスに request_id が入る仕組み

エラーハンドラーは `request` オブジェクトを受け取ります。
`get_request_id(request)` が `request.state.request_id` から取り出してレスポンスに含めます。

これにより、ユーザーが見たエラーレスポンスの `request_id` をサポートに伝えれば、
ログから対応するエントリを特定できます。

---

## 12. フロントエンドの内部実装

### サーバーサイドとクライアントサイドの判定

`lib/api.ts` では `typeof window` を使って実行環境を判定しています。

```typescript
function getApiBaseUrl(): string {
    if (typeof window === "undefined") {
        // Next.jsサーバー上での実行（SSR）
        return SERVER_API_BASE_URL;   // INTERNAL_API_BASE_URL = "http://backend:8000"
    }
    // ブラウザ上での実行（CSR）
    return `${window.location.protocol}//${window.location.hostname}:8000`;
}
```

`typeof window === "undefined"` が `true` のとき、そのコードはNode.js環境（サーバー）で動いています。
ブラウザ環境では `window` が定義されているため `false` になります。

ブラウザ側では `window.location.hostname` を使います。
`localhost` でアクセスしていれば `localhost:8000` に、
`127.0.0.1` でアクセスしていれば `127.0.0.1:8000` になります。
これによってCookieの `domain` と API の `hostname` が一致し、Cookieが正しく送信されます。

### server-auth.ts と api.ts の役割分担

| ファイル | 実行場所 | 用途 |
|---------|---------|------|
| `lib/server-auth.ts` | Next.jsサーバーのみ | ページレンダリング時の認証確認 |
| `lib/api.ts` | サーバー・ブラウザ両方 | 本のCRUD、ログイン等の通信 |

`server-auth.ts` は先頭に `import "server-only"` があります。
このimportはNext.jsが提供する「このファイルはサーバーでしか動かせない」という宣言です。
うっかりクライアントコンポーネントから呼び出すとビルドエラーになります。

### server-auth.ts での認証確認の仕組み

```typescript
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
    const cookieStore = await cookies();                    // Next.jsのCookieAPI
    const accessTokenCookie = cookieStore.get(AUTH_COOKIE_NAME);

    if (accessTokenCookie === undefined) {
        return null;                                        // Cookie未設定 → 未認証
    }

    const response = await fetch(`${SERVER_API_BASE_URL}/api/auth/me`, {
        cache: "no-store",
        headers: {
            Cookie: `${AUTH_COOKIE_NAME}=${accessTokenCookie.value}`,
        },
    });
    // ...
}
```

Next.jsサーバーからFastAPIを呼ぶとき、ブラウザは介在しないためCookieが自動送信されません。
`cookies()` でNext.jsサーバー内に来たCookieを読み取り、
FastAPIへのリクエストヘッダーに手動で付け直しています。

### ApiResult 型によるエラーハンドリング

`lib/api.ts` の全関数は `ApiResult<T>` 型を返します。

```typescript
type ApiResult<T> =
    | { ok: true; data: T }       // 成功
    | { ok: false; message: string }  // 失敗
```

try-catchをapi.ts内に閉じ込めることで、呼び出し元はエラー処理の詳細を知らなくて済みます。
呼び出し元は `result.ok` を確認するだけです。

```typescript
const result = await createBook(bookInput);
if (!result.ok) {
    setMessage(result.message);   // エラーメッセージを画面に表示
    return;
}
// result.data で Book オブジェクトを使う
```

### BookForm コンポーネントの状態管理

`BookForm` は5つのstateで状態を管理しています。

```typescript
const [formState, setFormState] = useState<FormState>()      // 各フィールドの入力値
const [message, setMessage] = useState<string | null>()       // 全体メッセージ
const [isSubmitting, setIsSubmitting] = useState(false)       // 送信中フラグ
const [isSuccess, setIsSuccess] = useState(false)             // 成功フラグ
const [fieldErrors, setFieldErrors] = useState<FieldErrors>() // フィールド単位エラー
```

送信時の処理フロー：

```
handleSubmit 実行
    │
    ├── buildBookInput() でフロントエンドバリデーション
    │   失敗: fieldErrors, message をセット → 終了
    │
    ├── isSubmitting = true（二重送信防止）
    │
    ├── onSubmitBook(bookInput) でAPIを呼ぶ
    │
    ├── 失敗: message をセット、isSubmitting = false → 終了
    │
    └── 成功: isSuccess = true, message をセット
              router.push("/books") で一覧へ遷移
              router.refresh() でサーバーサイドデータを再取得
```

`startTransition()` でラップしているのは、ページ遷移中に古いページが残り続けないようにするためです。

### BookForm の新規登録・編集での共通化

```typescript
type BookFormProps = {
    initialBook?: Book;                                        // 編集時は既存データ
    submitLabel?: string;
    onSubmitBook?: (input: BookInput) => Promise<ApiResult<Book>>;  // 登録/更新の差替え
};
```

`onSubmitBook` をpropsで差し替えることで、同じフォームコンポーネントを
新規登録（`createBook`）と編集（`updateBook`）の両方で使えます。

---

## 13. テストの内部構造

### conftest.py のフィクスチャ依存関係

```
test_engine (SQLiteインメモリDB作成・テーブル初期化)
    └── testing_session_local (セッションファクトリ生成)
            ├── db_session (直接DBを操作したいとき)
            └── client (APIテスト用TestClient)
                    └── override_get_db (本番のget_dbを差し替える)
```

各テストケースは使いたいフィクスチャを引数に書くだけで、
pytestがこの依存ツリーを解析して適切な順序でセットアップします。

### テスト用DBの設定

```python
def create_test_engine() -> Engine:
    return create_engine(
        "sqlite+pysqlite:///:memory:",   # メモリ上のSQLite（テスト終了で消える）
        connect_args={"check_same_thread": False},  # スレッド制約を緩和
        poolclass=StaticPool,            # 常に同じ接続を再利用
    )
```

`StaticPool` を使う理由：SQLiteのインメモリDBは接続ごとに別のDBになります。
`StaticPool` で常に同じ接続を使うことで、セッションをまたいでも同じインメモリDBを参照できます。

### get_db の差し替え

```python
def override_get_db() -> Generator[Session, None, None]:
    db = testing_session_local()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
```

`dependency_overrides` はFastAPIが提供するテスト用機能です。
`get_db` 関数をキーとして、テスト用の `override_get_db` に差し替えます。
アプリ本体のコードを変更せずに、テスト用DBにつなぎ替えられます。

### テスト内でのモデルクラスの import

```python
# conftest.py の末尾
_ = Book
_ = User
_ = AuditLog
```

これは `Base.metadata.create_all()` がテーブルを作るためにモデルクラスが import されている必要があるためです。
`Base.metadata` はimportされたモデルクラスを集めているため、
importしていないモデルのテーブルは作られません。
`_ = Book` という書き方で「使っていないが、importしたい」という意図を明示しています。

### テストヘルパー関数の設計

```python
def create_admin_and_login(client: TestClient) -> None:
    # bootstrap → login をまとめた初期化ヘルパー
    bootstrap_response = client.post("/api/admin/bootstrap", json={...})
    assert bootstrap_response.status_code == 201
    login_response = client.post("/api/auth/login", json={...})
    assert login_response.status_code == 200
```

bootstrap（初期管理者作成）と login を毎回書くのは冗長なため、
テストヘルパーとしてまとめています。
TestClientはCookieを保持するため、一度ログインすると以降のリクエストでCookieが自動送信されます。
