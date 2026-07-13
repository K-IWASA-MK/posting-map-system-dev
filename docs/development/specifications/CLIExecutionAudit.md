# CLI実行監査仕様書 (CLI Execution Audit Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、CLIOrchestratorを経由して起動されたすべてのコマンド実行トランザクション、カーネルレイヤーの呼び出し処理、判定結果、およびエラー詳細を「CLI実行監査ログ（CLI Audit Log）」として保存し、CLIを通じた不正操作や実行障害の決定論的追跡・監査を可能にするためのモデルを規定する。

---

## 監査ログ保護原則 (Append-Only Principles)
- **削除および改ざんの禁止**:
  - CLI実行監査ログは、データベースへの**追記（Append-Only）のみを許可**し、上書き（Update）や消去（Delete）のAPI/操作はシステムレベルで一切実装・実行されない。CLI自体がシステム監査の対象となる。

---

## 監査対象および記録項目 (Audit Targets)

### 1. コマンド実行履歴 (Command Execution History)
- **対象**: 開発者またはフックによりCLIコマンドが入力・受付された履歴。
- **記録項目**: 実行日時、Run ID、実行ユーザー、実行コマンド名、入力パラメータ。

### 2. カーネル呼び出し履歴 (Kernel Invocation History)
- **対象**: パイプライン内で各カーネルエンジン（Execution, Governance 等）が呼び出され、返答を受信した履歴。
- **記録項目**: 呼び出し開始・終了日時、対象レイヤー名、呼び出しステータス（Success / Failed）。

### 3. エラー・失敗履歴 (Error & Failure History)
- **対象**: パイプラインが失敗（Failed）判定となった、または例外処理により中断した履歴。
- **記録項目**: エラーコード、エラーメッセージ、スタックトレース情報。

---

## 監査ログデータ構造 (CLI Audit Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CLIAuditRecord",
  "type": "object",
  "properties": {
    "auditLogId": { "type": "string" },
    "runId": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "user": { "type": "string" },
    "commandName": { "type": "string" },
    "eventType": {
      "type": "string",
      "enum": ["CommandTriggered", "KernelInvoked", "ExecutionFailed", "CommandCompleted"]
    },
    "details": {
      "type": "object",
      "properties": {
        "targetLayer": { "type": "string" },
        "result": { "type": "string" },
        "errorMessage": { "type": "string" }
      }
    }
  },
  "required": ["auditLogId", "runId", "timestamp", "user", "commandName", "eventType", "details"]
}
```
