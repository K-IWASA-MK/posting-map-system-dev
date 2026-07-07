# シミュレーション監査仕様書 (Simulation Audit Specification)

## 目的
AIOS（品質保証オペレーティングシステム）のシミュレーション環境において、実行された検証シナリオの履歴、各模擬レイヤーが返した模擬結果、および実行されたバリデーションの監査証拠を「シミュレーション監査ログ（Simulation Audit Log）」として保存し、変更時の整合性保証のエビデンスとするためのデータ構造を規定する。

---

## 監査ログ不変原則 (Append-Only Principles)
- **削除および改ざんの禁止**:
  - シミュレーション監査ログは、データベースへの**追記（Append-Only）のみを許可**し、上書き（Update）や消去（Delete）の操作はシステムレベルで完全に遮断されなければならない。

---

## 監査対象および記録項目 (Audit Targets)

### 1. シナリオ実行履歴 (Scenario Executions)
- **対象**: テストされたシナリオ名、開始時刻、終了時刻。
- **記録項目**: シミュレーションID、シナリオID、実行日時、総合結果。

### 2. レイヤー結果記録 (Layer Response Records)
- **対象**: 各模擬レイヤー（Mock Layer）が処理された際の模擬応答。
- **記録項目**: レイヤー名、返却されたステータスコード、および出力データのハッシュ。

### 3. バリデーション結果履歴 (Validation Logs)
- **対象**: スキーマ適合チェック（Kernel Contract 照合）が実行された際のログ。
- **記録項目**: 照合された契約ID（Contract ID）、適合成否判定（Pass/Fail）、不適合時の未充足フィールドの詳細。

---

## 監査ログデータ構造 (Simulation Audit Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SimulationAuditRecord",
  "type": "object",
  "properties": {
    "auditLogId": { "type": "string" },
    "simulationId": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "eventType": {
      "type": "string",
      "enum": ["ScenarioStarted", "LayerSimulated", "ContractValidated", "ScenarioEnded"]
    },
    "details": {
      "type": "object",
      "properties": {
        "scenarioId": { "type": "string" },
        "layerName": { "type": "string" },
        "contractId": { "type": "string" },
        "validationStatus": { "type": "string" },
        "errorMessage": { "type": "string" }
      }
    }
  },
  "required": ["auditLogId", "simulationId", "timestamp", "eventType", "details"]
}
```
