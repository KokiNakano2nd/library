# 技術スタック入門ガイド

このディレクトリは、図書管理システムで使用している技術を初学者向けに解説したガイドです。  
各ファイルは「この技術は何か」「なぜ使うか」「このプロジェクトでどう使われているか」の観点で書いています。

---

## ファイル一覧

| ファイル | カバーする技術 |
|---|---|
| [01_backend.md](01_backend.md) | Python / FastAPI / SQLAlchemy / Pydantic / Alembic |
| [02_frontend.md](02_frontend.md) | TypeScript / React / Next.js |
| [03_infra.md](03_infra.md) | SQL・PostgreSQL / Docker / Docker Compose |
| [04_testing.md](04_testing.md) | pytest / FastAPI TestClient / Playwright |
| [05_security.md](05_security.md) | パスワードハッシュ（scrypt）/ JWT / Cookie / CORS |

---

## 読む順番のおすすめ

```
03_infra.md（SQL基礎）
    ↓
01_backend.md（Python・FastAPI・SQLAlchemy）
    ↓
02_frontend.md（TypeScript・React・Next.js）
    ↓
05_security.md（認証・セキュリティ）
    ↓
04_testing.md（テスト）
```

SQL とデータベースの概念を先に理解しておくと、バックエンドのコードが読みやすくなります。

---

## このガイドと他のドキュメントの関係

| ドキュメント | 内容 |
|---|---|
| `TECH_GUIDE/`（このディレクトリ） | 技術・言語・フレームワークの使い方 |
| `SYSTEM_OVERVIEW.md` | システム全体の設計・機能・構成（What/Why） |
| `INTERNAL_DESIGN.md` | コードレベルの実装の詳細（How） |

技術の基礎 → システム全体像 → 実装詳細 の順で読むと理解が深まります。
