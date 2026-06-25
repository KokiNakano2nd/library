# GitHub 運用ルール

## 1. このドキュメントの目的

本ドキュメントは、本リポジトリにおける GitHub 上の運用ルールを定義する。

ここで扱うのは、GitHub の設定で機械的にブロックする前段階として、人が守るべき書面ベースのルールである。

目的は次の通りである。

- Issue、Pull Request、レビュー、ブランチ運用の期待値を揃える
- 作業の入口から完了までの流れを明確にする
- README、ELPLANATION、LEARNING_PROGRESS と GitHub 上の作業管理を整合させる

## 2. 参照する GitHub 公式ドキュメント

- About issues  
  https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues
- Using templates to encourage useful issues and pull requests  
  https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests
- Creating a pull request template for your repository  
  https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository
- Managing labels  
  https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels
- About milestones  
  https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones
- Best practices for Projects  
  https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects
- About discussions  
  https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions
- About protected branches  
  https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- About code owners  
  https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

## 3. GitHub 運用の考え方

本リポジトリでは、GitHub 上の情報を次のように役割分担する。

- `README.md`
仕様の正本
- `BACKLOG.md`
将来候補の整理
- `Issue`
実際に着手候補または進行中の作業単位
- `Pull Request`
コード変更のレビュー単位
- `ELPLANATION`
実装内容や確認手順の説明
- `LEARNING_PROGRESS.md`
学習進捗の記録

GitHub Projects や Labels は、これらの運用を見やすくする補助として使う。

## 4. 書面ルールと設定ルールの切り分け

GitHub の運用ルールには 2 種類ある。

- 書面ルール
人が判断して守るルール
- 設定ルール
GitHub の設定で守らないと進めないようにするルール

本ドキュメントでは書面ルールを扱う。

設定ルールの例は次の通りである。

- main への直 push を禁止する
- CI 成功前は merge できない
- review なしでは merge できない
- CODEOWNERS 承認を必須にする

これらは後続で GitHub 設定として整備する。

## 5. Issue の運用

Issue の詳細ルールは [GITHUB_ISSUE_OPERATION_RULES.md](C:/Users/rnm21/AI_Coding_study/Library/ELPLANATION/GITHUB_ISSUE_OPERATION_RULES.md) を正本とする。

ここでは全体運用上の位置付けだけを再確認する。

- Backlog から着手候補になったものを Issue 化する
- 1 Issue は 1 テーマとする
- Issue には背景、目的、対応範囲、完了条件を書く
- 実装に着手したら Assignee を付ける
- PR と紐付けて進める

## 6. Pull Request の運用

Pull Request は、コード差分をレビューし、main へ取り込むための単位である。

### 基本ルール

- 原則として 1 PR は 1 つ以上の Issue に紐付ける
- PR は小さく保つ
- 関係のない変更を混ぜない
- Draft PR を積極的に使ってよい

### PR に必ず含める内容

- 関連 Issue
- 変更概要
- 何を変更して、何を変更していないか
- 確認方法
- 実施したテスト
- README や説明ドキュメント更新の有無

### PR 本文の考え方

- `Closes #番号` または `Refs #番号` を記載する
- 仕様変更がある場合は README 更新を明記する
- 画面変更がある場合は確認観点を明記する
- バックエンド変更がある場合は API 影響範囲を明記する

## 7. レビューの運用

レビューは、単なる承認作業ではなく、仕様差分、回帰、保守性、確認漏れを見つけるための工程である。

### レビュー時に確認する観点

- README の仕様と一致しているか
- 関係のない変更が混ざっていないか
- 正常系だけでなく異常系も考慮されているか
- frontend / backend / DB / E2E の影響範囲が把握されているか
- テストが不足していないか
- 説明ドキュメント更新が必要なのに漏れていないか

### レビュー結果の扱い

- 修正が必要なら、何が問題かを具体的に書く
- 方針確認が必要なら、質問として返す
- approve は、完了条件を満たしていると判断できるときに行う

## 8. ブランチ運用

書面ベースでは、次を原則とする。

- main へ直接作業しない
- 作業用ブランチを切って PR 経由で取り込む
- 1 ブランチ 1 テーマを基本にする
- 長期間生きる作業ブランチを避ける

### ブランチ名の例

- `feature/book-search`
- `production/cors-cookie-settings`
- `bug/login-redirect-fix`
- `docs/github-operation-rules`

ブランチ名は、種類と目的が分かる形を推奨する。

## 9. Labels の運用

Labels は分類のために使う。

### 基本の考え方

- 種類を示す Label
- 優先度を示す Label
- 状態を示す Label

### 推奨例

- 種類: `feature` `production` `bug`
- 優先度: `priority:high` `priority:medium` `priority:low`
- 状態: `needs-triage` `ready` `in-progress` `blocked`

Label は増やしすぎると逆に使われなくなるため、最初は少数に絞る。

## 10. Milestone の運用

Milestone は、Issue や PR をグループ単位で追跡するために使う。

### 使い方

- Step 単位で束ねる
- フェーズ単位で束ねる
- リリース単位で束ねる

### 例

- `Step 30`
- `Production Foundations`
- `Feature: Search and Listing`

Milestone は分類ではなく、進捗まとまりの単位として使う。

## 11. Discussions を使う境界

GitHub 公式では、Discussion は質問、情報共有、オープンな会話に向いているとされている。

本リポジトリでも次のように使い分ける。

- まだ作業単位に落ちていない相談: Discussion 向き
- 実装、修正、対応として着手するもの: Issue 向き

### Discussion 向きの例

- この機能は本当に必要か
- どの順番で学習するか
- soft delete を採用するべきか

### Issue 向きの例

- `/api/books` に検索条件を追加する
- login 失敗時のエラー表示を修正する
- branch protection 方針を README に反映する

## 12. ドキュメント更新の運用

GitHub 上の作業は、コード変更だけで完了しない。

### 更新先の原則

- 仕様変更: `README.md`
- 実装説明、確認手順: `ELPLANATION`
- 学習進捗: `LEARNING_PROGRESS.md`
- 将来候補: `BACKLOG.md`

### 運用ルール

- PR では、どのドキュメントを更新したかを明記する
- 仕様変更があるのに README 更新がない状態を避ける
- Playwright 実施時は証跡パスも説明ドキュメントに残す

## 13. Close の考え方

Issue や PR は、実装だけで機械的に完了とみなさない。

### Issue を close してよい状態

- 完了条件を満たしている
- 必要なテストが終わっている
- 必要なドキュメントが更新されている
- 関連 PR が merge 済みである

### PR を merge してよい状態

- 変更内容が明確である
- レビューで問題が解消している
- 確認方法が明記されている
- 必要な README / ELPLANATION 更新がある

## 14. まず定着させるべき最小ルール

最初から細かくしすぎず、まずは次を確実に守る。

1. 1 Issue 1 テーマにする
2. 1 PR 1 テーマにする
3. PR には関連 Issue を書く
4. README 更新要否を必ず確認する
5. テストまたは確認手順を必ず残す

## 15. 今後 GitHub 設定で強制したい項目

書面ルールが定着したら、次を GitHub 設定で強制する。

- main への直 push 制限
- PR review 必須
- CI status checks 必須
- conversation resolution 必須
- CODEOWNERS の導入
- merge 後の branch 自動削除

## 16. 次に整備する候補

この文書の次に整備するとよいものは次の通りである。

- PR template
- CODEOWNERS
- Labels 初期セット
- branch protection 方針書
- GitHub Projects の列設計
