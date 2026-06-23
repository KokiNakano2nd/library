# Project Rules

## Architecture

Frontend:
Next.js

Backend:
FastAPI

Database:
PostgreSQL

## API Design

REST API

## Directory Structure

frontend/
backend/

## Development Policy

機能追加は小さく行う

1機能ごとにコミットする

## Specification Source of Truth

本システムの仕様のSSoT（Single Source of Truth）としてREADME.mdを利用する

方針や仕様を変更する場合は、実装と合わせてREADME.mdを更新する

## Documentation

README.md、LEARNING_ROADMAP.md、LEARNING_PROGRESS.md、ELPLANATION配下の説明ファイルなど、Markdownドキュメントは原則として日本語で記載する

コード、コマンド、API名、型名、ファイルパスなど、英語表記が自然な技術用語は英語のまま記載してよい

ドキュメントに構成図や処理フローなどの図を記載する場合は、Mermaid記法を使用する

README.mdにはシステムの方針と仕様のみを記載し、細かい操作手順、起動手順、学習用の追加説明は記載しない

操作手順、起動手順、技術的な補足説明は、StepごとにELPLANATION/EXPLANATION_STEP{番号}.mdを作成して記載する

GitHub Actions、push、pull request、Actions実行結果確認などGitHub上の操作が関わるStepでは、ELPLANATION/EXPLANATION_STEP{番号}.mdにGitHub上で行う操作手順、確認画面、期待される結果も記載する

新規追加したファイル、関数、型、画面、API通信処理については、役割、呼び出し関係、なぜ必要か、何を保証できて何を保証できないかをELPLANATION/EXPLANATION_STEP{番号}.mdに具体的に記載する

ELPLANATION/EXPLANATION_STEP{番号}.mdには、機能概要だけでなく「実装部分のコードレベル説明」を必ず記載する

コードレベル説明では、追加・変更した主要な関数、型、Component、API通信関数、router、service、repository、schema、modelについて、入口、引数、戻り値、state、例外、HTTPステータス、内部処理の順番、呼び出し先、正常系と異常系の分岐、初学者がコードを読む順番を具体的に記載する

コードレベル説明は「説明だけの羅列」にせず、対象コードの抜粋と説明をセットで記載する。原則として、`### ファイル名` の直下に短いコードブロックを置き、その直後に「このコードで何が起きているか」を説明する

動作確認で利用したコマンドは、サーバー起動、疎通確認、lint、buildなどを含めてELPLANATION/EXPLANATION_STEP{番号}.mdに記載する

動作確認で利用したコマンドは、まとめて1つのコードブロックにせず、1コマンドごとに目的、実行ディレクトリ、コマンドを分けて記載する

動作確認コマンドはWindows PowerShellで実行できる表記を基本とし、Windowsの相対パスは `.\.venv\Scripts\python.exe` のように記載する

画面遷移が完了条件に含まれる場合は、ブラウザで確認する操作手順、入力値、期待される遷移先URL、画面上の期待結果をELPLANATION/EXPLANATION_STEP{番号}.mdに記載する

学習の実装順序はLEARNING_ROADMAP.md、学習進捗はLEARNING_PROGRESS.mdに記載する

## Testing

挙動確認を行う場合は、必ずPlaywrightによるテストを実施する

Playwrightで取得したエビデンスは `C:\Users\rnm21\AI_Coding_study\Library\test\evidence` に格納する

エビデンスはStepごとに識別できるよう、Step番号を含むファイル名またはディレクトリ名で管理する

ELPLANATION/EXPLANATION_STEP{番号}.mdには、対応するPlaywrightテストの内容、実行コマンド、保存したエビデンスのパスを記載する

## Learning Progress

コードの実装が完了するたびに、LEARNING_PROGRESS.mdのステータス、チェック項目、理解度、日付、コミットなどの該当箇所を更新する

完了基準が不明確な場合は、独断で完了と判断せず、対話形式でユーザーに確認する

## Don't

認証機能を勝手に追加しない
Docker化を勝手に行わない

# Coding Rules

## Frontend: Next.js / TypeScript
- Use TypeScript with strict mode.
- Use Next.js official ESLint configuration.
- Prefer functional components.
- Use named exports for components.
- Keep components small and focused.
- Separate API access logic from UI components.
- Avoid `any` unless there is a clear reason.
- Use meaningful variable and function names.
- Use Prettier for formatting.

## Backend: Python / FastAPI
- Follow PEP 8.
- Use Ruff for linting and formatting.
- Use type hints for all function arguments and return values.
- Split FastAPI routers by feature.
- Keep API route handlers thin.
- Put business logic in service modules.
- Put DB access in repository/CRUD modules.
- Use Pydantic models for request and response schemas.
- Avoid global mutable state.

## Common
- Explain changes before writing large code.
- Prefer simple code over clever code.
- Add comments only when the intent is not obvious.
- Keep file and folder structure beginner-friendly.
