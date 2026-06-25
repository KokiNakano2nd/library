# GitHub Issue 運用ルール

## 1. このドキュメントの目的

本ドキュメントは、本リポジトリで GitHub Issue をどのように作成、分類、進行、完了させるかを定義する。

目的は次の 3 つである。

- Issue の粒度と書き方を揃える
- 進行中の作業と未着手の作業を見分けやすくする
- Pull Request、README、テスト、説明ドキュメントとの関係を明確にする

本ルールは GitHub 公式ドキュメントで案内されている Issue、Labels、Milestones、Projects、Issue Forms の考え方を土台にし、本リポジトリ向けに具体化したものである。

## 2. 参照する GitHub 公式ドキュメント

- About issues  
  https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues
- Using templates to encourage useful issues and pull requests  
  https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests
- Managing labels  
  https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels
- About milestones  
  https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones
- Best practices for Projects  
  https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects

## 3. 基本方針

- GitHub Issue は、`idea` `feedback` `task` `bug` を追跡するために使う
- 実際に着手する単位は Backlog ではなく Issue で管理する
- 1 Issue は 1 テーマに絞る
- 大きなテーマは親 Issue と子 Issue に分割する
- 進行中の変更は Pull Request と結び付ける
- 状態、優先度、責任者が見える状態を保つ
- 仕様変更がある場合は README を SSoT として更新する

## 4. Issue の種類

本リポジトリでは、少なくとも次の 3 種類を使う。

- `Feature`
利用者向けの機能追加、機能改善
- `Production`
本番対応、運用改善、セキュリティ、監視、設定整理
- `Bug`
不具合、期待仕様との差分修正

必要になった場合は追加で次を使ってよい。

- `Docs`
ドキュメント整備が主目的のもの
- `Chore`
依存関係更新、補助的な整備、内部改善

## 5. 1 Issue の粒度

GitHub 公式の Projects ベストプラクティスでは、大きい Issue を小さい Issue に分割し、作業を並行しやすくすることが推奨されている。

そのため、本リポジトリでは次をルールとする。

- 1 Issue は 1 PR で閉じられる粒度を基本にする
- 完了条件を文章で明確に書けない Issue は大きすぎると判断する
- 複数の関心事が混ざる場合は分割する
- 親子関係が必要な場合は親 Issue を作り、詳細は子 Issue に切る

### 粒度の良い例

- books 一覧に検索機能を追加する
- CORS と Cookie 設定を本番向けに整理する
- `/health` を readiness と liveness に分ける

### 粒度の悪い例

- 図書管理システムを本番レベルにする
- フロントエンドを全部改善する
- セキュリティを全部対応する

## 6. Issue に必ず書く内容

Issue template を使い、最低限次の情報を揃える。

- 概要
- 背景または目的
- 対応範囲
- 今回やらないこと
- 完了条件
- 想定リスクまたは影響範囲

理由は、GitHub 公式が Issue Forms により必要情報を揃え、意味のある Issue を集める運用を案内しているためである。

## 7. Labels の使い方

GitHub 公式では Labels を使って Issue、Pull Request、Discussion を分類することが案内されている。

本リポジトリでは、少なくとも次の観点で Labels を使う。

- 種類
`feature` `production` `bug`
- 優先度
`priority:high` `priority:medium` `priority:low`
- 状態
`needs-triage` `ready` `in-progress` `blocked`

### Label 運用ルール

- すべての Issue に種類 Label を付ける
- 着手順を管理したい Issue には優先度 Label を付ける
- 進行管理したい Issue には状態 Label を付ける
- 状態 Label は同時に 1 つだけを基本とする

## 8. Milestone の使い方

GitHub 公式では、Milestone を使って Issue や Pull Request のまとまりの進捗を追跡できると案内している。

本リポジトリでは、次のようなまとまりで使う。

- Step 単位
- リリース単位
- フェーズ単位

### 例

- `Step 30`
- `Production Foundations`
- `Search and List Improvements`

Milestone は個々の Issue の分類ではなく、まとまりの進捗確認に使う。

## 9. Assignee の使い方

GitHub 公式では、Issue に担当者を割り当てることで責任の所在を明確にできると案内している。

本リポジトリでは次をルールとする。

- 着手したら Assignee を付ける
- `in-progress` の Issue は Assignee が付いている状態にする
- Assignee が付いていない `in-progress` は避ける

## 10. Pull Request との関係

GitHub 公式では、Issue と Pull Request をリンクし、`fixes:` などのキーワードで自動 close できることが案内されている。

本リポジトリでは次をルールとする。

- 原則として 1 PR は 1 つ以上の Issue に紐付ける
- PR 本文には `Closes #番号` もしくは `Refs #番号` を記載する
- Issue だけ作ってコード変更と切り離したまま放置しない

## 11. Close の条件

Issue はコードを書いただけでは close しない。

次を満たしたときに close する。

- 完了条件を満たしている
- 必要なテストまたは確認手順が完了している
- 仕様変更がある場合は README が更新されている
- 必要な `ELPLANATION` ドキュメントが更新されている
- 必要な場合は `LEARNING_PROGRESS.md` が更新されている
- 対応 PR が merge 済み、または同等の完了状態にある

## 12. Backlog との関係

本リポジトリでは、`BACKLOG.md` は候補一覧として使う。

- Backlog は「将来やる可能性がある事項」を整理する場所
- 実際に着手候補として管理する段階になったら Issue 化する
- Issue 化したら、日常の進行管理は GitHub 上で行う

二重管理を避けるため、進捗や担当、細かい実行状態は Backlog ではなく Issue 側に寄せる。

## 13. 大きいテーマの扱い

GitHub 公式では、大きいテーマを sub-issue や dependency で分解することが案内されている。

本リポジトリでも次を推奨する。

- 大きいテーマは親 Issue を作る
- 実装単位は子 Issue に分割する
- ブロッカーがある場合は dependency を明示する

### 例

- 親 Issue: 一覧 API の商用化
- 子 Issue: 検索
- 子 Issue: ページネーション
- 子 Issue: 並び替え

## 14. 推奨運用フロー

1. Backlog から着手候補を選ぶ
2. Issue template で Issue を作成する
3. 種類 Label と優先度 Label を付ける
4. 必要なら Milestone に入れる
5. 着手時に Assignee を付けて `in-progress` にする
6. PR を作成し `Closes #番号` で紐付ける
7. テスト、README、説明ドキュメント更新を確認する
8. merge 後に Issue を close する

## 15. この運用ルールで重視していること

- Issue の粒度を揃える
- 何のための作業かを先に明確にする
- GitHub 上の metadata を活用して一覧性を上げる
- README を仕様の正本として保つ
- 「着手中なのに誰も担当していない」「完了したのに close されていない」といった状態を減らす

## 16. 今後の拡張候補

今後、Issue 運用をさらに本番運用に近づける場合は次を検討する。

- GitHub Projects の導入
- custom fields による優先度、期日、Step 管理
- 自動 Label 付与や自動 Project 追加
- PR merge 時の自動 status 更新
- monthly triage ルールの明文化
