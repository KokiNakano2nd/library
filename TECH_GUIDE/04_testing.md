# テスト技術ガイド

pytest / FastAPI TestClient / Playwright

---

## 1. pytest

### pytest とは

Python のテストを書くためのフレームワーク。  
「テスト関数を書くだけで自動で実行・結果を表示」してくれます。

---

### 基本的なテスト

```python
# test_ で始まる関数がテストとして認識される
def test_addition():
    result = 1 + 1
    assert result == 2   # assert が False になるとテスト失敗

def test_string():
    name = "太郎"
    assert "太" in name
    assert len(name) == 2
```

**実行方法**:
```bash
pytest                          # すべてのテストを実行
pytest tests/test_books.py      # 特定ファイルだけ
pytest -v                       # 詳細表示
```

---

### フィクスチャ（`@pytest.fixture`）

テストの「事前準備・後片付け」を共通化する仕組みです。

```python
@pytest.fixture
def sample_book():
    return {"title": "Python入門", "author": "山田太郎"}

# フィクスチャを引数に書くと自動で注入される
def test_book_title(sample_book):
    assert sample_book["title"] == "Python入門"
```

`yield` を使うと「後片付け」もできます：
```python
@pytest.fixture
def db_connection():
    conn = open_connection()
    yield conn          # ここでテスト関数に渡す
    conn.close()        # テスト終了後に実行
```

---

### conftest.py

フィクスチャを **複数のテストファイルで共有** するための特別なファイル。  
`conftest.py` に書いたフィクスチャは同じディレクトリのテスト全体で使えます。

---

### このプロジェクトのフィクスチャの依存ツリー

```
test_engine
    └── testing_session_local
            ├── db_session     ← DB に直接データを入れたいとき
            └── client         ← HTTP リクエストを送りたいとき
```

各フィクスチャが次のフィクスチャを「材料」として受け取っています：

```python
@pytest.fixture
def test_engine() -> Generator[Engine, None, None]:
    # SQLite インメモリDBのエンジンを作る
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",     # メモリ上の使い捨てDB
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,              # テスト用の接続プール
    )
    Base.metadata.create_all(bind=engine)  # テーブルを全部作る
    try:
        yield engine
    finally:
        Base.metadata.drop_all(bind=engine)  # テスト後にテーブルを全部消す


@pytest.fixture
def testing_session_local(test_engine: Engine) -> sessionmaker[Session]:
    # test_engine を使う sessionmaker を返す
    return sessionmaker(bind=test_engine, autocommit=False, autoflush=False)


@pytest.fixture
def db_session(testing_session_local: sessionmaker) -> Generator[Session, None, None]:
    db = testing_session_local()
    try:
        yield db
    finally:
        db.close()
```

---

### StaticPool とは

テスト用の特別な接続プール。

通常の SQLite はスレッドをまたいで同じ接続を使えませんが、  
`StaticPool` を使うと「常に同じ接続を使い回す」ようになります。

```python
from sqlalchemy.pool import StaticPool

create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,   # ← これがないとテスト中にデータが見えなくなる
)
```

インメモリ SQLite では「接続ごとに別のDB」になる仕組みのため、  
テストフィクスチャとテスト本体が別接続になるとデータが共有されません。  
`StaticPool` はそれを防ぎます。

---

### `_ = Book` の意味

```python
# conftest.py の末尾
_ = Book
_ = User
_ = AuditLog
```

`Base.metadata.create_all()` は「Base を継承しているモデルのテーブルを全部作る」ですが、  
Python はインポートされていないモジュールのクラスを認識しません。

`_ = Book` と書くことで「このクラスをインポートしてね」と明示しています。  
（`_` は「使わない変数」を表す慣習的な変数名）

---

## 2. FastAPI TestClient

### TestClient とは

FastAPI アプリに HTTP リクエストを「実際のサーバーなしで」送れるテスト用クライアント。

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_books():
    response = client.get("/api/books")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

---

### dependency_overrides（依存関係の差し替え）

テスト時に「本物の DB」を「テスト用 DB」に差し替える仕組み。

```python
# 本番コード
@router.get("/api/books")
def list_books(db: Session = Depends(get_db)):   # 本物の get_db が使われる
    ...

# テスト時の差し替え
def override_get_db():
    db = testing_session_local()   # テスト用DBのセッション
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db  # get_db を差し替え

# テスト後に元に戻す
app.dependency_overrides.clear()
```

これにより：
- テストは本番 DB に影響しない
- テストごとにクリーンな状態から始められる

---

### テストの書き方例

```python
def test_create_book(client: TestClient, db_session: Session):
    # テスト用の管理者ユーザーを DB に作成
    admin = User(email="admin@example.com", role="admin", ...)
    db_session.add(admin)
    db_session.commit()

    # ログインして Cookie を取得
    login_response = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "password"
    })
    assert login_response.status_code == 200

    # 本を作成
    response = client.post("/api/books", json={
        "title": "Python入門",
        "author": "山田太郎"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Python入門"
```

---

## 3. Playwright

### Playwright とは

ブラウザを自動操作して E2E（End-to-End）テストをするフレームワーク。  
ユーザーが実際にブラウザで操作する流れをコードで再現します。

---

### E2E テストとは

```
単体テスト:  関数1つが正しく動くか確認
結合テスト:  複数の関数が組み合わさって動くか確認
E2Eテスト:  ブラウザでログイン→本一覧表示→登録 などの流れ全体を確認
```

---

### 基本的な書き方（TypeScript）

```typescript
import { test, expect } from "@playwright/test";

test("本の一覧が表示される", async ({ page }) => {
    // ページを開く
    await page.goto("http://localhost:3000/books");

    // ログインが必要ならリダイレクトされる
    await page.fill('[name="email"]', "admin@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');

    // 本の一覧ページに遷移したことを確認
    await expect(page).toHaveURL("/books");

    // 本が表示されていることを確認
    await expect(page.locator("h1")).toContainText("Book list");
});
```

---

### よく使うメソッド

```typescript
// ページ操作
await page.goto("http://localhost:3000/books");  // URLに移動
await page.click("button");                       // クリック
await page.fill('[name="email"]', "value");       // 入力欄に文字を入れる
await page.selectOption("select", "option1");     // セレクトボックスを選択

// 要素の取得
page.locator("h1")                    // CSS セレクタで要素を取得
page.getByText("本を登録")            // テキストで要素を取得
page.getByRole("button", { name: "送信" })  // ロールで取得（アクセシビリティ重視）

// 検証（assert）
await expect(page).toHaveURL("/books");                    // URL の確認
await expect(page.locator("h1")).toContainText("Book list");  // テキストの確認
await expect(page.locator(".error")).toBeVisible();         // 要素が表示されているか
```

---

### バックエンドテストとの違い

| | pytest + TestClient | Playwright |
|---|---|---|
| テストする範囲 | バックエンド API だけ | フロントエンド + バックエンド + DB の全体 |
| 速さ | 速い | 遅い（ブラウザを実際に起動するため） |
| 何を検証できるか | JSON レスポンス | 画面表示・ユーザー操作 |
| いつ使う | API の動作確認 | ユーザーが使う流れの確認 |

---

### このプロジェクトの CI 構成

```
.github/workflows/
├── backend-ci.yml   → pytest を実行
├── frontend-ci.yml  → TypeScript の型チェック、ビルド確認
└── e2e-ci.yml       → Playwright を実行（Docker Compose で全サービス起動）
```

E2E テストは Docker Compose でバックエンド・フロントエンド・DB を全部起動した状態で  
本物のブラウザ（ヘッドレスモード）を操作してテストします。
