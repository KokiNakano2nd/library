# Step 19: backend の CI 導入

## このStepでやったこと

Step 19 では、backend でローカル実行していた lint と API テストを GitHub Actions に移し替えるため、workflow ファイルを追加しました。  
今回は画面や API 仕様を変える Step ではなく、`backend` 配下の Python コード品質確認を自動化する基盤を追加する Step です。

## 変更したファイル

| ファイル | 役割 |
| --- | --- |
| `.github/workflows/backend-ci.yml` | GitHub Actions 上で backend の install、lint、test を実行する workflow |
| `backend/requirements.txt` | CI とローカルで共通利用する Python 依存関係に `ruff` を追加する |
| `ELPLANATION/EXPLANATION_STEP19.md` | Step 19 の意図、workflow の読み方、確認コマンド、GitHub 上の確認手順を残す |

## 実装部分のコードレベル説明

### `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

on:
  push:
    paths:
      - ".github/workflows/backend-ci.yml"
      - "backend/**"
  pull_request:
    paths:
      - ".github/workflows/backend-ci.yml"
      - "backend/**"

jobs:
  backend-quality:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: "sqlite+pysqlite:///:memory:"
    defaults:
      run:
        working-directory: backend
```

このコードで何が起きているか:

- 入口: GitHub 上での `push` または `pull_request`
- 引数: 変更されたファイル群
- 戻り値: GitHub Actions の job 実行結果
- `paths` により、backend 関連ファイルか workflow 自身が変わったときだけ CI を起動します
- `backend-quality` という job 名を分けたことで、Actions 画面で「backend 品質確認の job」が落ちたと判断しやすくしています
- `env` にテスト用の `DATABASE_URL` を置き、`app.database` の import 時点で `DATABASE_URL is not set` にならないようにしています
- `working-directory: backend` を設定しているため、以降の `pip install -r requirements.txt` や `pytest` は backend 直下を基準に動きます
- 正常系では checkout 後に backend 依存関係 install、lint、test が順番に流れます
- 異常系では `ruff check` `ruff format --check` `pytest` のどこで失敗したかが step 名で分かります

### `.github/workflows/backend-ci.yml`

```yaml
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Set up Python
        uses: actions/setup-python@v6
        with:
          python-version: "3.13"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -e .

      - name: Run Ruff check
        run: ruff check .

      - name: Run Ruff format check
        run: ruff format --check .

      - name: Run pytest
        run: python -m pytest
```

このコードで何が起きているか:

- 入口: `backend-quality` job 開始後の step 実行
- 引数: Python 3.13、`backend/requirements.txt`、`backend` 配下の Python コード
- 戻り値: 各 step の成功 / 失敗
- `actions/checkout@v5` と `actions/setup-python@v6` は Node 24 対応版です
- `actions/setup-python@v6` で CI 上の Python バージョンを固定しています
- `pip install -r requirements.txt` はローカルで使っている依存関係をそのまま CI に移植する役目です
- `pip install -e .` は `backend/setup.py` を使って `app` パッケージを import 可能にし、CI 上の `ModuleNotFoundError: No module named 'app'` を避けます
- `ruff check .` は import 順や未使用 import などの静的検査を行います
- `ruff format --check .` は整形されていないファイルを検出し、フォーマット差分が混ざったまま merge されるのを防ぎます
- `python -m pytest` は `backend/tests` の API テストを実行します
- 今回の API テストは `tests/conftest.py` で SQLite の in-memory DB に差し替えるため、workflow 側の `DATABASE_URL` は import 初期化を通すための最低限の値として使われます
- 呼び出し順番は、Python 準備 → 依存関係 install → editable install → lint → format check → test です
- この順番にした理由は、構文や整形の崩れを先に落としてからテストへ進むと、失敗の切り分けがしやすいためです

### `backend/requirements.txt`

```text
pytest==9.0.2
httpx==0.28.1
ruff==0.12.0
```

このコードで何が起きているか:

- 入口: ローカルの `pip install -r requirements.txt` と GitHub Actions の Install dependencies step
- 引数: Python 依存パッケージ名とバージョン
- 戻り値: 仮想環境または CI 環境へ install された実行ツール
- `ruff` を requirements に追加したことで、ローカルと CI の両方で同じ lint / format check コマンドを使えます
- これにより「ローカルでは存在するが CI にはないツール」というズレを避けています
- 保証できることは、requirements から backend の lint / test に必要な依存を再現できることです
- 保証できないことは、GitHub Actions 上での実行結果そのものです。これは実際に push して確認する必要があります

## なぜこの変更が必要か

- Step 9 までに `pytest` で API テストを回せるようになっていました
- ただし、毎回手動で `pytest` や整形確認を実行するだけでは、確認漏れが起こりえます
- Step 19 では backend だけを対象に小さく CI を導入し、Python 側の品質確認を継続実行できる状態を先に作ります
- frontend CI や Docker Compose を使う E2E CI は Step 20、Step 21 で段階的に分けて扱います

## 初学者がコードを読む順番

1. `backend/requirements.txt` を見て、CI が何を install するか確認する
2. `.github/workflows/backend-ci.yml` の `on` と `jobs` を読む
3. `backend-quality` job の step を上から順に読む
4. `backend/tests/test_books_api.py` を見て、`pytest` が何を確認しているか理解する
5. `backend/app` を読み、テスト対象の API 実装へ戻る
6. この `EXPLANATION_STEP19.md` を読み、ローカルコマンドと GitHub Actions の対応関係を整理する

## ローカル確認コマンド

目的: CI で使う Python 依存関係をローカル仮想環境へそろえる  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\backend`

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

目的: `app` パッケージを import できるように editable install を行う  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\backend`

```powershell
.\.venv\Scripts\python.exe -m pip install -e .
```

目的: backend の静的解析が通ることを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\backend`

```powershell
.\.venv\Scripts\ruff.exe check .
```

目的: backend の Python ファイルが整形済みであることを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\backend`

```powershell
.\.venv\Scripts\ruff.exe format --check .
```

目的: backend の API テストが成功することを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library\backend`

```powershell
.\.venv\Scripts\python.exe -m pytest
```

## GitHub上で行う操作手順

### push して Actions を起動する手順

1. GitHub にこのプロジェクトの repository を作成し、ローカル作業ディレクトリをその repository に接続する
2. `.github/workflows/backend-ci.yml` と `backend/requirements.txt` を含む変更を push する
3. GitHub の repository 画面で `Actions` タブを開く
4. 一覧に `Backend CI` workflow が表示されることを確認する
5. 最新実行を開き、`backend-quality` job が開始されていることを確認する

### GitHub上で確認する画面と期待結果

- 確認画面: repository の `Actions` タブ
  - 期待結果: `Backend CI` という workflow 名が表示される
- 確認画面: workflow run 詳細画面
  - 期待結果: `Set up Python` `Install dependencies` `Run Ruff check` `Run Ruff format check` `Run pytest` が上から順に表示される
- 確認画面: `backend-quality` job の結果表示
  - 期待結果: すべての step が緑で完了する
- 失敗時の見方:
  - `Run Ruff check` 失敗なら Python コード規約違反を疑う
  - `Run Ruff format check` 失敗なら未整形ファイルを疑う
  - `Run pytest` 失敗なら API 実装かテストコードの回帰を疑う

## Playwrightテストと証跡

- 本 Step は GitHub Actions workflow の追加であり、画面挙動の変更はありません
- そのため、新しい Playwright テストや証跡は追加していません
- 画面動作の代表確認は Step 17 の Docker Compose 向け Playwright テストを参照します

## このStepで理解してほしいこと

- CI は「ローカルで毎回打っていた確認コマンドを GitHub 上へ移植する」作業です
- workflow を読むときは、`on` で起動条件、`jobs` で実行単位、`steps` で実行順を追うと理解しやすいです
- backend CI を先に分離しておくと、次の Step 20 で frontend の lint / build を追加するときに責務を比較しやすくなります
