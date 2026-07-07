# テスト監査仕様書 (Test Audit Specification)

## 目的
ローカルシミュレーションテストの実行ライフサイクル（開始、各検証、合否、障害情報）を不変のエビデンスとして追跡・保存するための「テスト監査ログ（Test Audit Log）」の構造および不変保護ルールを規定する。

---

## 監査ログ不変原則 (Append-Only Principles)
- **削除および改ざんの禁止**:
  - テスト監査ログは、ファイルまたはデータベースへの**追記（Append-Only）のみを許可**し、上書き（Update）、消去（Delete）、または結果改ざん（成功への書換等）の操作はシステムレベルで厳密に禁止する。

---

## 監査対象および記録項目 (Audit Targets)

### 1. テスト実行履歴 (Test Run Logs)
- **対象**: テストスイートが起動され、結果が集約されるまでの履歴。
- **記録項目**: テスト実行セッションID（Test Run ID）、実行日時、Quality Gate 総合合否判定。

### 2. 回帰テスト結果 (Regression Results)
- **対象**: 各接続契約（Contract）およびシナリオ（Scenario）が適合チェックを受けた履歴。
- **記録項目**: テストケース名、合否結果（PASS/FAIL）、警告メッセージ。

### 3. 障害検知ログ (Failure Details)
- **対象**: テストが不合格（FAIL）となった際の、不整合フィールドや違反内容。
- **記録項目**: 失敗した模擬レイヤー名、エラーコード、エラーメッセージ。

---

## テスト監査データ構造 (Test Audit Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TestAuditRecord",
  "type": "object",
  "properties": {
    "testAuditId": { "type": "string" },
    "testRunId": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "eventType": {
      "type": "string",
      "enum": ["TestStarted", "RegressionValidated", "BoundaryChecked", "TestEnded"]
    },
    "details": {
      "type": "object",
      "properties": {
        "scenarioId": { "type": "string" },
        "testCaseName": { "type": "string" },
        "status": { "type": "string" },
        "failedLayer": { "type": "string" },
        "errorMessage": { "type": "string" }
      }
    }
  },
  "required": ["testAuditId", "testRunId", "timestamp", "eventType", "details"]
}
```
