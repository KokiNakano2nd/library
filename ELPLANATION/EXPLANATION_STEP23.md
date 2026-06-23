# Step 23: GitHub への初回アップロード手順

## この Step でやること
この Step では、今ローカルで管理しているこのソースコードを GitHub の新しい repository に初回アップロードする手順をまとめます。

README.md は仕様の SSoT なので、GitHub へ上げる作業手順そのものは README ではなくこの説明ファイルに分離します。

## この Step の前提

- GitHub アカウントは作成済み
- Git for Windows がインストール済み
- 作業ディレクトリは `C:\Users\rnm21\AI_Coding_study\Library`
- 公開したくないファイルは `.gitignore` で除外する

## この Step で関係するファイル

| ファイル | 役割 |
| --- | --- |
| `.gitignore` | GitHub に上げたくないファイルを Git の管理対象から外す |
| `README.md` | GitHub 上で repository を開いたときに最初に読まれる仕様書 |
| `ELPLANATION/EXPLANATION_STEP23.md` | 今回の GitHub アップロード手順を残す説明ファイル |

## 実装部分のコードレベル説明

### `.gitignore`

```gitignore
# Python
__pycache__/
*.py[cod]
.venv/

# Environment variables
.env
.env.local

# Next.js
frontend/.next/
frontend/node_modules/
```

このコードで何が起きているか:

- Git は `git add .` を実行すると、通常は作業ディレクトリ配下のファイルをまとめて追加候補にします
- ただし `.gitignore` に書かれたパスやパターンは、未追跡ファイルである限り追加対象から外れます
- `.venv/` を除外することで、Python 仮想環境そのものを repository に入れずに済みます
- `.env` と `.env.local` を除外することで、DB 接続文字列や環境変数を誤って push しにくくなります
- `frontend/.next/` と `frontend/node_modules/` を除外することで、ビルド成果物や依存パッケージ本体を上げずに済みます
- この設定で保証できるのは「未追跡状態の不要ファイルを add しにくくすること」です
- すでに Git 管理対象に入ってしまったファイルを自動で消すわけではないため、その場合は `git rm --cached` など別の対応が必要です

### `README.md`

```md
# Library App
```

このコードで何が起きているか:

- GitHub の repository を開いたとき、通常は `README.md` の内容がトップページ下部に表示されます
- このプロジェクトでは README を仕様の SSoT として扱うため、GitHub 上でも「この repository が何のためのものか」を最初に説明する入口になります
- 初回アップロードではファイルの中身を変えなくても、README が存在することで repository の目的を伝えやすくなります

## GitHub 上で行う操作手順

1. ブラウザで GitHub にログインする
2. 右上の `+` から `New repository` を開く
3. Repository name を入力する
4. `Public` または `Private` を選ぶ
5. `Add a README file` はチェックしない
6. `.gitignore` と `Choose a license` も初回は未選択のままにする
7. `Create repository` を押す
8. 作成直後の画面で、`…or push an existing repository from the command line` の例を確認する

`README` や `.gitignore` を GitHub 側で先に作ると、ローカルの初回 push 前に履歴が分かれます。今回はローカルで整理済みのソースコードをそのまま上げたいので、空の repository を作る方が手順が単純です。

## PowerShell で行う操作手順

### 1. Git コマンドが使えるか確認する

目的:
Git がインストール済みか確認する

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git --version
```

期待する結果:
`git version 2.x.x.windows.x` のような表示が出る

### 2. 現在のディレクトリが Git 管理済みか確認する

目的:
すでに repository 初期化済みかを確認する

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git status
```

期待する結果:

- すでに Git 管理済みなら、現在のブランチ名や変更ファイル一覧が表示される
- まだ Git 管理されていないなら、`not a git repository` のようなエラーになる

### 3. Git 管理されていない場合だけ初期化する

目的:
このフォルダを Git repository として使えるようにする

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git init
```

期待する結果:
`.git` が作成され、Git で履歴管理できるようになる

### 4. 初回 push 用のブランチ名を `main` にそろえる

目的:
GitHub 側の標準的なブランチ名に合わせる

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git branch -M main
```

期待する結果:
現在の作業ブランチ名が `main` になる

### 5. 追加対象を確認する

目的:
GitHub に上げる前に、どのファイルが追加対象か確認する

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git status --short
```

期待する結果:

- `README.md`
- `frontend/`
- `backend/`
- `ELPLANATION/`

など、上げたいファイルだけが表示される

もし `.env` や `frontend/node_modules/` が表示される場合は、先に `.gitignore` を見直します。

### 6. すべての追加対象を staging する

目的:
初回コミットに含めるファイルを確定する

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git add .
```

期待する結果:
`git status --short` を再実行すると、追加対象が `A` や `M` として表示される

### 7. 初回コミットを作成する

目的:
GitHub に push する元になるローカル履歴を 1 つ作る

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git commit -m "chore: initial repository import"
```

期待する結果:
コミット ID と変更ファイル数が表示される

### 8. GitHub の repository を remote に登録する

目的:
このローカル repository が、どの GitHub repository に push するかを覚えさせる

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git remote add origin https://github.com/<GitHubユーザー名>/<repository名>.git
```

期待する結果:
エラーが出ず、`origin` という名前で GitHub の URL が登録される

すでに `origin` がある場合は、追加ではなく URL の確認を先に行います。

### 9. remote の設定内容を確認する

目的:
push 先 URL の打ち間違いを防ぐ

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git remote -v
```

期待する結果:
`origin` に GitHub の repository URL が表示される

### 10. GitHub に初回 push する

目的:
ローカルの `main` ブランチを GitHub にアップロードする

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git push -u origin main
```

期待する結果:

- GitHub への認証が求められた場合は、ブラウザまたは資格情報入力で認証する
- push 成功後、`branch 'main' set up to track 'origin/main'` のような表示が出る

`-u` を付けることで、次回以降は `git push` や `git pull` を短く実行しやすくなります。

## ブラウザでの確認手順

1. GitHub の repository ページを再読み込みする
2. URL が `https://github.com/<GitHubユーザー名>/<repository名>` になっていることを確認する
3. ファイル一覧に `frontend` `backend` `README.md` `ELPLANATION` が表示されることを確認する
4. `README.md` の内容がトップページ下部に表示されることを確認する
5. `Commits` を開いて、`chore: initial repository import` が見えることを確認する

## よくある詰まりどころ

### `git status` で `not a git repository` と出る

まだ初期化されていません。`git init` を実行してから進めます。

### `git remote add origin ...` で `remote origin already exists` と出る

すでに remote が登録されています。まず次のコマンドで確認します。

目的:
既存の remote URL を確認する

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git remote -v
```

必要なら次のコマンドで URL を差し替えます。

目的:
既存の `origin` を正しい GitHub repository URL に変更する

実行ディレクトリ:
`C:\Users\rnm21\AI_Coding_study\Library`

コマンド:

```powershell
git remote set-url origin https://github.com/<GitHubユーザー名>/<repository名>.git
```

### `git push` で認証エラーになる

- GitHub のパスワードではなく、ブラウザ認証や Personal Access Token が必要な場合があります
- Git for Windows の認証画面が出たら、その案内に従ってサインインします
- 企業アカウントや 2 要素認証を使っている場合は、通常のパスワードだけでは通らないことがあります

## この Step で保証できること

- ローカルのソースコードを GitHub の新規 repository に初回アップロードする手順を追える
- `.gitignore` を見ながら、不要ファイルを避けて push する確認ポイントを把握できる
- GitHub 上と PowerShell 上の両方で何を確認すればよいか分かる

## この Step では保証しないこと

- GitHub Actions の自動実行
- pull request の作成
- branch 運用ルールの整備
- CI/CD の構築

これらは Step 19 以降の CI 学習や運用整理で別途扱います。

## 今回は実施していないこと

- 実際の `git push`
- GitHub 上での repository 作成
- Playwright による画面操作確認

今回は操作手順書の追加だけを行い、GitHub への外部操作そのものは実行していません。
