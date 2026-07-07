# フック実行監査仕様書 (Hook Execution Audit Specification)

## 目的
Git のコミットフック（`pre-commit`）やデプロイ前検証フックの起動状況、実行されたコマンド、得られたテスト結果、および割り当てられた Run ID などの関連コンテキストを「フック実行監査ログ（Hook Audit Log）」として保存し、開発ライフサイクル上のすべての検証操作を不変の追記記録（Append-Only）として記録するスキーマを規定する。

---

## 監査ログ不変原則 (Append-Only Principles)
- **削除および改ざんの禁止**:
  - フック実行監査ログは、データベースへの**追記（Append-Only）のみを許可**し、上書き（Update）や消去（Delete）のAPI/操作はシステムレベルで一切実装・実行されない。

---

## 監査対象および記録項目 (Audit Targets)

### 1. フック起動イベント (Hook Trigger Events)
- **対象**: フック（pre-commit または pre-deploy）が実行開始されたイベント。
- **記録項目**: フックID（Hook ID）、起動イベント型（Commit/Deploy）、起動された元のコマンド名。

### 2. 品質ゲート適合判定結果 (Quality Gate Result)
- **対象**: 自動検証テストが完了し、Quality Gate が合否（Allow / Block）を判断したイベント。
- **記録項目**: 総合合否結果（PASS/FAIL）、フックの終了 Exit Code（0 または 1）、タイムスタンプ、対応するテスト Run ID。

---

## フック実行監査データ構造 (Hook Audit Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "HookExecutionAuditRecord",
  "type": "object",
  "properties": {
    "hookAuditId": { "type": "string" },
    "hookId": { "type": "string" },
    "runId": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "eventType": {
      "type": "string",
      "enum": ["HookTriggered", "HookCompleted"]
    },
    "details": {
      "type": "object",
      "properties": {
        "eventSource": {
          "type": "string",
          "enum": ["git-pre-commit", "clasp-pre-deploy"]
        },
        "commandName": { "type": "string" },
        "gateResult": {
          "type": "string",
          "enum": ["Passed", "Blocked"]
        },
        "exitCode": { "type": "integer" }
      }
    }
  },
  "required": ["hookAuditId", "hookId", "runId", "timestamp", "eventType", "details"]
}
```
