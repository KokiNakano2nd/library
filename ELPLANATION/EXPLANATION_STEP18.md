# Step 18: Docker化内容のドキュメント反映

## このStepでやったこと

Step 18 では、Step 11 から Step 17 で追加した Docker 関連の構成を README に反映し、README を SSoT として読み返したときに Docker Compose 運用の前提を追える状態へ整理しました。  
今回はアプリの挙動を変えていないため、新しい API や画面は追加していません。変更対象は `README.md` `LEARNING_ROADMAP.md` `LEARNING_PROGRESS.md` `ELPLANATION/EXPLANATION_STEP18.md` の 4 ファイルです。

## 変更したファイル

| ファイル | 役割 |
| --- | --- |
| `README.md` | Docker 関連ファイルと Docker Compose 上での確認方針を仕様として明記する |
| `LEARNING_ROADMAP.md` | Step 18 を完了済みに更新する |
| `LEARNING_PROGRESS.md` | 現在地を Step 18 完了へ進め、次の Step 19 を記録する |
| `ELPLANATION/EXPLANATION_STEP18.md` | Step 18 の意図、変更内容、確認コマンド、参照した証跡を残す |

## 実装部分のコードレベル説明

### `README.md`

```md
## 10. Docker関連ファイルと確認方針

- `docker-compose.yml`: `frontend` `backend` `db` を同時に起動する構成
- `frontend/e2e/docker-compose-books-crud.spec.ts`: Docker Compose 上での CRUD E2E
- `test/evidence/step17-playwright`: Docker Compose 上の CRUD E2E 証跡

Docker 運用では、ブラウザ公開用の `NEXT_PUBLIC_API_BASE_URL` と、
Next.js サーバー実行用の `INTERNAL_API_BASE_URL` を分ける。
```

この追記で何が起きているか:

- Step 18 の入口は README の仕様更新です
- ここでは Docker 化で増えたファイルのうち、運用判断に必要なものだけを列挙しています
- `docker-compose.yml` は 3 サービスをまとめて起動する前提を表します
- `frontend/e2e/docker-compose-books-crud.spec.ts` は Docker Compose 上の代表的な E2E として扱っています
- `test/evidence/step17-playwright` を README に結び付けることで、「どの確認結果を証跡とみなすか」を README 側からも追えるようにしました
- `NEXT_PUBLIC_API_BASE_URL` と `INTERNAL_API_BASE_URL` を分ける説明は、Docker 化後に最も誤解しやすい通信経路を README 上で固定するために必要です
- README は「方針と仕様だけ」を置く場所なので、実行手順の細部は書かず、確認方針だけを残しています

保証できること:

- README を読むだけで Docker Compose 運用の主要ファイルと確認基準を把握できます
- browser 用 URL と container 内部通信用 URL を分ける前提を仕様として確認できます

保証できないこと:

- 実際の起動手順や個別コマンドの詳細までは README 単体では保証しません
- 詳細な作業順や初学者向けの読み順は `ELPLANATION` 側で補います

### `LEARNING_ROADMAP.md`

```md
- [x] Step 18: Docker化内容のドキュメント反映
```

このコードで何が起きているか:

- Step 一覧の完了チェックを Step 18 まで進めています
- 入口は学習計画のチェックリストで、引数や戻り値はありません
- 正常系では Step 18 が完了済みとして見えるようになります
- 異常系はなく、ドキュメントの整合だけを扱います

### `LEARNING_PROGRESS.md`

```md
| 現在のStep | Step 18完了 |
| 次に行うこと | Step 19としてbackendのCI構築に進む |

### Step 18: Docker化内容のドキュメント反映
- [x] README に Docker 化後の構成、関連ファイル、確認方針を反映できる
```

このコードで何が起きているか:

- 現在地を Step 18 完了へ進めています
- 次に着手する Step 19 を明示して、学習の流れが止まらないようにしています
- Step 18 の完了条件を箇条書きで固定し、何をもって完了としたかを後から確認できるようにしています
- README の更新だけでなく、進捗の説明責任もここで持たせています

## なぜこの変更が必要か

- Step 11 以降で Dockerfile、`docker-compose.yml`、Docker 向け Playwright テストが増えました
- これらが README に戻っていないと、SSoT と実装がずれて「実装はあるが仕様書から読めない」状態になります
- Step 18 はそのずれを解消し、次の CI 構築で「何を自動化すべきか」を README から判断できるようにする役割があります

## 初学者がコードを読む順番

1. `README.md` の Docker 関連セクションを読む
2. `docker-compose.yml` を読んで `frontend` `backend` `db` の関係を見る
3. `frontend/e2e/docker-compose-books-crud.spec.ts` を読んで Docker Compose 上で何を確認しているか理解する
4. `LEARNING_ROADMAP.md` と `LEARNING_PROGRESS.md` で Step 18 の位置付けを確認する
5. この `EXPLANATION_STEP18.md` を読んで、なぜ README にその内容を書いたのかを確認する

## 確認で利用したコマンド

目的: README に Docker 関連の記述がある位置を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
rg -n "Docker|docker|Compose|compose|NEXT_PUBLIC_API_BASE_URL|INTERNAL_API_BASE_URL|DATABASE_URL" README.md -S
```

目的: Step 18 の完了チェック位置を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
rg -n "Step 18|STEP18" LEARNING_ROADMAP.md LEARNING_PROGRESS.md README.md ELPLANATION -S
```

目的: Docker 向け Playwright テストと証跡の実在を確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
Get-ChildItem frontend\e2e -Recurse
```

目的: Step 17 の証跡ディレクトリを確認する  
実行ディレクトリ: `C:\Users\rnm21\AI_Coding_study\Library`

```powershell
Get-ChildItem test\evidence -Recurse
```

## Playwrightテストと証跡

- 本 Step ではアプリ挙動を変えていないため、新しい Playwright テストは追加していません
- Docker Compose 上の代表的な動作確認は Step 17 の `frontend/e2e/docker-compose-books-crud.spec.ts` を参照します
- 参照した証跡パス:
  - `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step17-playwright\01-books-initial.png`
  - `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step17-playwright\02-book-created.png`
  - `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step17-playwright\03-book-updated.png`
  - `C:\Users\rnm21\AI_Coding_study\Library\test\evidence\step17-playwright\04-book-deleted.png`

## このStepで理解してほしいこと

- Docker 化をしたら、実装だけでなく README も同じ粒度で更新する必要があります
- browser から見える URL と container 内部で使う URL は一致しない場合があり、その違いを README に残すことが重要です
- Step 18 は機能追加ではなく、Step 19 以降の CI や運用自動化で迷わないための土台を整える Step です
