# GitHub チーム開発向け設定・運用チェックリスト

## このドキュメントの目的

このドキュメントは、複数人で GitHub リポジトリを運用するときに、最初に決めておくと事故が減る設定と運用ルールを整理したものです。

特に、次のような問題を減らすことを目的にしています。

- `main` ブランチへの直接 push
- レビュー未実施のままの merge
- CI 未通過コードの取り込み
- secret の誤 push
- 管理者権限の持ちすぎ
- ブランチ運用のばらつき
- `git pull` の理解不足による意図しない取り込み

## まず設定したい最重要項目

小規模チームでも、まずは次の設定を推奨します。

1. `main` への直接 push を禁止する
2. `main` への反映は Pull Request 経由のみにする
3. Pull Request の merge 前に review を必須にする
4. CI の成功を merge 条件にする
5. review コメント未解決のまま merge できないようにする
6. `CODEOWNERS` を用意して自動で review 依頼できるようにする
7. secret scanning / push protection を有効にする

## 推奨設定一覧

| 分類 | 設定項目 | 推奨度 | 推奨内容 | 目的 |
| --- | --- | --- | --- | --- |
| ブランチ保護 | `main` を ruleset / branch protection の対象にする | 必須 | `main` を保護対象にする | 重要ブランチを保護する |
| ブランチ保護 | `Require a pull request before merging` | 必須 | 有効 | 直接反映を防ぐ |
| ブランチ保護 | `Restrict who can push to matching branches` | 必須 | 原則として通常開発者は push 不可 | `main` 直接 push を防ぐ |
| ブランチ保護 | `Do not allow bypassing the above settings` | 強く推奨 | 有効 | 管理者だけ例外、を防ぐ |
| レビュー | `Require pull request reviews before merging` | 必須 | 有効 | 最低 1 名以上の確認を必須化する |
| レビュー | Required approvals 数 | 必須 | 小規模なら 1、大きめなら 2 | レビュー品質を担保する |
| レビュー | `Require conversation resolution before merging` | 強く推奨 | 有効 | 指摘未解決の merge を防ぐ |
| CI | `Require status checks before merging` | 必須 | 有効 | lint / test 未通過コードの取り込みを防ぐ |
| CI | 必須 status checks の選定 | 必須 | `lint`, `test`, `build` など | 品質ゲートを明確にする |
| 所有者管理 | `CODEOWNERS` | 強く推奨 | 導入する | 変更箇所ごとのレビュアー責任を明確化する |
| セキュリティ | Secret scanning | 強く推奨 | 有効 | 漏えいした secret を検知する |
| セキュリティ | Push protection | 強く推奨 | 有効 | secret を含む push 自体を止める |
| 権限管理 | Repository roles | 必須 | 最小権限にする | 権限の持ちすぎを防ぐ |
| 監査性 | Signed commits | 任意だが有効 | 必要に応じて有効 | 誰の commit かを追いやすくする |
| 履歴管理 | Linear history | 任意 | チーム運用に合わせて有効 | 履歴を追いやすくする |
| 高頻度 merge | Merge queue | PR 数が多い場合に推奨 | 必要なら有効 | `main` 最新状態での整合性を保つ |

## 実務上のおすすめ初期値

迷ったら、まずは次の設定から始めると運用しやすいです。

### 1. `main` ブランチ保護

- `main` への直接 push を禁止
- PR 経由でのみ反映可能
- force push 禁止
- branch 削除禁止

### 2. Pull Request の merge 条件

- Approvals: 1 人以上
- `Require conversation resolution before merging`: 有効
- `Require status checks before merging`: 有効
- 必須 checks: `lint`, `test`

### 3. 権限

- 一般開発者: `Write`
- リポジトリ設定を変更する人だけ: `Admin` または必要最小限のカスタム権限
- 管理者は少人数に限定

### 4. レビュールール

- `CODEOWNERS` を置く
- フロントエンド、バックエンド、インフラなどで担当範囲を分ける
- 重要ディレクトリは必ず担当者 review が入るようにする

### 5. セキュリティ

- Secret scanning を有効化
- Push protection を有効化
- GitHub Actions の `GITHUB_TOKEN` 権限は最小化

## よくあるローカル運用ルール

GitHub の設定だけではなく、ローカル側でもブランチ運用のルールを決めておくと事故が減ります。
これは GitHub 側のような強制設定というより、チームの作法として揃えるものです。

### ブランチ作成と作業開始

- `main` では作業しない
- 作業開始前に `main` を最新化する
- `main` から `feature/*` や `fix/*` を切る
- 1 ブランチ 1 目的にする
- 1 PR 1 目的にする

### ブランチ名の命名規則

よくある例は次の通りです。

- `feature/add-book-form`
- `fix/api-timeout`
- `refactor/book-service`
- `docs/update-readme`
- `chore/update-eslint`

ポイントは、見ただけで目的が分かることです。

### ブランチの寿命

- 長生きブランチを避ける
- 差分が大きくなりすぎる前に PR を出す
- 作業が終わったブランチは削除する

### `main` との同期

- PR を出す前に `main` の変更を取り込む
- conflict は早めに解消する
- チームで `merge` と `rebase` の方針を揃える

### commit 運用

- commit を意味のある単位で分ける
- WIP のまま長く放置しない
- commit message の書き方を揃える

例:

- `feat: add book creation form`
- `fix: handle empty title validation`
- `docs: update API description`

## ローカルルールはどこまで強制できるか

ローカル側のルールは、かなりチーム運用寄りです。
GitHub 側ほど強制力はありません。

一応、ローカルフックで補助はできます。

- `pre-commit` で危険な commit を警告する
- `pre-push` で `main` への push を止める
- Husky などで hook を配布する

ただし、ローカルフックは次の特徴があります。

- 各開発者の環境依存になりやすい
- 無効化できる
- 導入状態にばらつきが出ることがある

そのため考え方としては、次の役割分担が安全です。

- ローカル: ミスに早く気づくための補助
- GitHub: 最終的に守らせる本番ガード

## `git pull` とブランチの考え方

### ローカルと GitHub は常に完全一致させるのか

常に全部を完全一致させる、というより、
「自分が今いるローカルブランチを、どのリモートブランチと同期するか」を決めて使います。

つまり、Git はリポジトリ全体を毎回丸ごと一致させるのではなく、ブランチ単位で追跡します。

### `git pull` は何をしているか

`git pull` は基本的に次の 2 つをまとめて実行します。

1. `git fetch`
2. `git merge` または `git rebase`

そのため、どのブランチを pull するかは選べます。

### pull するブランチは選べるか

選べます。

たとえば、ローカルの `main` がリモートの `origin/main` を追跡していれば、
`main` 上で `git pull` すると通常は `origin/main` を取り込みます。

一方で、ローカルの `feature/add-book-form` は、次のように運用が分かれます。

- `origin/feature/add-book-form` を追跡して自分の作業ブランチを同期する
- 必要に応じて `origin/main` を取り込んで最新の基準ブランチに合わせる

つまり、用途によって pull 先は変わります。

## よくあるブランチ同期パターン

### 1. `main` を最新化してから作業ブランチを切る

```powershell
git switch main
git pull origin main
git switch -c feature/add-book-form
```

これは最も基本的な流れです。

### 2. 作業ブランチを自分のリモートブランチと同期する

```powershell
git switch feature/add-book-form
git pull
```

この場合は、そのローカルブランチが追跡しているリモートブランチを pull します。

### 3. 作業ブランチに `main` の最新を取り込む

```powershell
git switch feature/add-book-form
git fetch origin
git merge origin/main
```

または rebase 方針なら:

```powershell
git switch feature/add-book-form
git fetch origin
git rebase origin/main
```

この操作は「自分の feature ブランチを最新の `main` に追従させる」ためのものです。

### 4. pull 先を明示して取り込む

```powershell
git pull origin main
```

これは「今いるローカルブランチに対して `origin/main` を取り込む」という意味です。
ブランチをまたいで取り込めるので、何を入れるかを理解して使う必要があります。

## チームで揃えた方がいい pull / 同期ルール

このあたりはチームで統一しておくと混乱しにくいです。

- `main` を最新化してからブランチを切る
- PR 前に `main` を取り込む
- `merge` で取り込むか `rebase` で取り込むかを決める
- `git pull` をそのまま使うか、`git fetch` 後に明示的に `merge` / `rebase` するかを決める

実務では、初心者を含むチームなら次のどちらかに寄せることが多いです。

### パターン A: 分かりやすさ優先

- `git fetch`
- `git merge origin/main`

履歴は少し複雑になりますが、動作を理解しやすいです。

### パターン B: 履歴のきれいさ優先

- `git fetch`
- `git rebase origin/main`

履歴はきれいになりやすいですが、rebase の理解が必要です。

## 初学者が混乱しやすい点

### `git pull` は常に `main` を取ってくるわけではない

今いるローカルブランチが、どのリモートブランチを追跡しているかで変わります。

### GitHub 上にブランチがあるだけでは自動でローカルに同期されない

`git fetch` や `git pull` をして初めてローカルの認識が更新されます。

### `feature` ブランチ上で `git pull origin main` すると `main` を feature に取り込む

便利ですが、何が起きているか分からないまま使うと混乱しやすいです。

## 小規模チーム向けのおすすめ運用

3 人前後の小規模チームなら、次の構成が現実的です。

- `main` への直接 push 禁止
- PR 必須
- approval 1 名必須
- CI 必須
- コメント解決必須
- `CODEOWNERS` 導入
- Admin は 1 〜 2 名
- ローカルでは `main` で作業しない
- 作業開始前に `main` を `pull`
- PR 前に `main` を取り込む

## PR 数が多いチームで追加検討したい項目

チーム規模が大きくなってきたら、次も検討します。

- approval 2 名必須
- merge queue の導入
- signed commits の必須化
- branch naming rule の統一
- issue / PR template の整備
- GitHub Actions の environment protection rules

## 設定時の注意点

### ルールを厳しくしすぎると開発速度が落ちる

たとえば、人数が少ないのに常に 2 approvals 必須にすると、レビュー待ちで止まりやすくなります。
チーム人数と開発速度のバランスで決める必要があります。

### 管理者だけ bypass できる設定は、実質ルール破りになりやすい

緊急時を除いて、管理者も通常フローを通る方が履歴がきれいに残ります。
そのため、`Do not allow bypassing the above settings` は有効を基本に考える方が安全です。

### CI を必須にするなら、CI は安定していないといけない

CI が頻繁に不安定だと、保護ルール自体が開発の妨げになります。
まずは短時間で安定して回る check から必須化するのが現実的です。

### `merge` と `rebase` を混在させると混乱しやすい

どちらが正しいかというより、チームでどちらを基本にするかを決めて揃える方が重要です。

## 最初の導入順

おすすめの導入順は次の通りです。

1. `main` の保護
2. PR review 必須化
3. CI 必須化
4. コメント解決必須化
5. `CODEOWNERS` 導入
6. ローカルのブランチ命名と同期ルールを決める
7. Secret scanning / push protection
8. 必要に応じて signed commits, merge queue

## 参考リンク

- GitHub Docs: About rulesets  
  https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
- GitHub Docs: About protected branches  
  https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- GitHub Docs: About code owners  
  https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- GitHub Docs: Push protection  
  https://docs.github.com/en/code-security/concepts/secret-security/push-protection
- GitHub Docs: Secure use reference for GitHub Actions  
  https://docs.github.com/en/actions/reference/security/secure-use

## このリポジトリで次にやるとよいこと

このリポジトリで実際に GitHub をチーム運用するなら、次の順で着手すると進めやすいです。

1. `main` の ruleset を設定する
2. GitHub Actions の lint / test を required checks に登録する
3. `CODEOWNERS` を追加する
4. PR template を追加する
5. ブランチ命名規則と `pull` / 同期ルールを決める
6. 権限ロールを見直す
