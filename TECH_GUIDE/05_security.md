# セキュリティ技術ガイド

パスワードハッシュ / JWT / Cookie / CORS

---

## 1. パスワードハッシュ（scrypt）

### なぜパスワードをそのまま保存してはいけないのか

```
✗ 悪い例: パスワードをそのまま保存
users テーブル: password = "mypassword123"
→ DBが流出したら全ユーザーのパスワードが丸見え
```

```
✓ 良い例: パスワードをハッシュ化して保存
users テーブル: password_hash = "scrypt$16384$8$1$abc...$xyz..."
→ DBが流出しても元のパスワードは分からない
```

---

### ハッシュとは

入力から「一方向に変換した値」。同じ入力からは必ず同じ出力が得られますが、  
出力から入力を逆算することは（計算量的に）できません。

```
"mypassword123" → [ハッシュ関数] → "abc123def456..."

"abc123def456..." → [ハッシュ関数の逆] → ??? （逆算できない）
```

---

### scrypt とは

パスワード専用のハッシュアルゴリズム。  
「意図的に計算を重くする」ことで総当たり攻撃（ブルートフォース）を防ぎます。

---

### このプロジェクトでのハッシュ形式

```
scrypt$16384$8$1$<salt_base64>$<key_base64>
  ↑      ↑  ↑ ↑       ↑               ↑
アルゴリズム名 N  r  p  ランダムな塩   ハッシュ値
```

- `N=16384, r=8, p=1` → scrypt のコストパラメータ（大きいほど重い）
- `salt`（塩） → ランダムな 16 バイトの値。同じパスワードでも毎回違うハッシュにするため

**実装**（`services/security.py`）:
```python
def hash_password(password: str) -> str:
    salt = os.urandom(16)         # ランダムな16バイトの塩を生成
    key = hashlib.scrypt(
        password.encode(),
        salt=salt,
        n=16384, r=8, p=1,
        dklen=32,
    )
    salt_b64 = base64.b64encode(salt).decode()
    key_b64 = base64.b64encode(key).decode()
    return f"scrypt$16384$8$1${salt_b64}${key_b64}"

def verify_password(password: str, hashed: str) -> bool:
    # ハッシュ文字列から salt を取り出す
    parts = hashed.split("$")
    salt = base64.b64decode(parts[4])
    stored_key = base64.b64decode(parts[5])

    # 同じ salt で再計算
    key = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1, dklen=32)

    # 比較（タイミング攻撃対策のため compare_digest を使う）
    return hmac.compare_digest(key, stored_key)
```

**`compare_digest` を使う理由**:  
通常の `==` 比較は「最初の1文字が違えばすぐ False を返す」（早期終了）ため、  
応答時間の微妙な差から正しい文字を推測される攻撃（タイミング攻撃）が可能になります。  
`compare_digest` は常に全文字を比較するので時間が一定になります。

---

## 2. JWT（JSON Web Token）

### JWT とは

「このユーザーは認証済みです」という情報を、改ざん検知付きで伝える仕組み。  
サーバーはセッション情報を保存せず、トークン自体に情報を入れます。

---

### JWT の構造

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiIxMiIsImV4cCI6MTcwMDAwMDAwMH0
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

[ヘッダー].[ペイロード].[署名]
```

それぞれ Base64URL エンコードされた JSON です：

```json
// ヘッダー
{ "alg": "HS256", "typ": "JWT" }

// ペイロード（実際の情報）
{ "sub": "12", "exp": 1700000000 }
// sub = subject（ユーザーID）、exp = expiration（有効期限）

// 署名 = HMAC-SHA256(ヘッダー + "." + ペイロード, 秘密鍵)
```

---

### なぜ署名が必要か

```
ペイロードを {"sub": "12", "exp": ...} から {"sub": "1", "exp": ...} に書き換えて
ユーザー12のふりをしようとしても...

→ 署名が合わなくなるのでサーバーに弾かれる
```

署名の検証には秘密鍵が必要なので、秘密鍵を知らない人は正しい署名を作れません。

---

### このプロジェクトの JWT 実装

外部ライブラリを使わず、Python 標準ライブラリだけで実装しています：

```python
def create_access_token(user_id: int) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "exp": int((datetime.now(UTC) + timedelta(hours=24)).timestamp()),
    }

    # Base64URL エンコード（= を削除、+ を -、/ を _ に変換）
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).rstrip(b"=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b"=")

    # HMAC-SHA256 で署名
    signing_input = header_b64 + b"." + payload_b64
    signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=")

    return (signing_input + b"." + signature_b64).decode()
```

---

### JWT の検証

```python
def decode_access_token(token: str) -> dict:
    parts = token.split(".")
    # 署名を再計算して一致するか確認
    signing_input = f"{parts[0]}.{parts[1]}".encode()
    expected_sig = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    actual_sig = base64.urlsafe_b64decode(parts[2] + "==")

    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError("署名が不正")

    payload = json.loads(base64.urlsafe_b64decode(parts[1] + "=="))

    if payload["exp"] < datetime.now(UTC).timestamp():
        raise ValueError("トークンの有効期限切れ")

    return payload
```

---

## 3. Cookie

### Cookie とは

ブラウザが「小さなデータを保存して、次のリクエストに自動で付けて送る」仕組み。  
このプロジェクトでは JWT をブラウザに保存するために Cookie を使います。

---

### Cookie の属性

| 属性 | 設定値 | 意味 |
|---|---|---|
| `httponly` | `True` | JavaScript から読めない（XSS 対策） |
| `samesite` | `"lax"` | 別サイトからのリクエストには自動送信しない（CSRF 対策） |
| `secure` | `False`（開発） / `True`（本番） | HTTPS のみで送信 |
| `max_age` | `86400`（24時間） | Cookie の有効期間（秒） |

---

### HttpOnly Cookie とは

```
通常の Cookie: JavaScript からも読める
document.cookie  → "access_token=eyJ..."  ← XSS で盗まれる可能性がある

HttpOnly Cookie: JavaScript からは読めない
document.cookie  → ""  ← XSS があっても盗めない
```

ブラウザは自動で HTTP リクエストに Cookie を付けるので、  
JavaScript から読む必要はありません。

---

### SameSite=lax とは

別ドメインからのリクエストに Cookie を付けないかを制御します。

```
攻撃サイト (evil.com) に以下の HTML があったとする:
<img src="http://library.com/api/books/1" style="display:none" />

SameSite=none → Cookie が自動で付いてしまう → CSRF 攻撃が成立
SameSite=lax  → GET ナビゲーション以外は Cookie を付けない → 軽減できる
SameSite=strict → 別サイトからは一切 Cookie を付けない → 最も厳しい
```

---

### ログアウト時の Cookie 削除

```python
# ログアウト: Cookie を空にして有効期限を 0 にする
response.delete_cookie(
    key="access_token",
    httponly=True,
    samesite="lax",
)
```

---

## 4. CORS（Cross-Origin Resource Sharing）

### CORS とは

「別のオリジン（ドメイン）からの HTTP リクエストを許可するか」のブラウザルール。

```
オリジン = プロトコル + ドメイン + ポート
http://localhost:3000  ←→  http://localhost:8000  は別オリジン
```

ブラウザはセキュリティ上、デフォルトで別オリジンへの通信をブロックします（同一オリジンポリシー）。  
CORS を設定すると、特定のオリジンからのアクセスを許可できます。

---

### このプロジェクトの設定

```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Next.js 開発サーバー
        "http://127.0.0.1:3000",
        "http://localhost:3011",    # E2E テスト用
        "http://localhost:3012",    # E2E テスト用
    ],
    allow_credentials=True,   # Cookie を含むリクエストを許可
    allow_methods=["*"],      # 全 HTTP メソッドを許可
    allow_headers=["*"],      # 全ヘッダーを許可
)
```

**`allow_credentials=True` が重要**:  
Cookie を含むリクエストを許可するには `allow_credentials=True` が必要です。  
ただしこれを設定すると `allow_origins=["*"]`（ワイルドカード）は使えません。  
明示的にオリジンを列挙する必要があります。

---

### プリフライトリクエスト

POST/PUT などの「変更を伴うリクエスト」を送る前に、ブラウザは  
`OPTIONS` メソッドで「このリクエストを許可しますか？」と事前確認します。  
FastAPI の CORS ミドルウェアはこれを自動で処理します。

```
ブラウザ → OPTIONS /api/books （プリフライト）
FastAPI  → 200 OK + Access-Control-Allow-Origin: http://localhost:3000
ブラウザ → POST /api/books （本来のリクエスト）
```
