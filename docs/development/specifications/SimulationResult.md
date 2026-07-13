# シミュレーション結果仕様書 (Simulation Result Specification)

## 目的
AIOS（品質保証オペレーティングシステム）の統合検証シミュレーターを実行した結果、生成されるサマリーレポート（Simulation Result）のデータモデル、適合ステータス、およびエラー追跡のための構造を定義する。

---

## 結果モデル (Simulation Result Model)
各シミュレーション検証完了時に出力される結果オブジェクトの構造。

- **Simulation ID**: 実行されたシミュレーションに割り当てられる一意の識別ID（例: `SIM-2026-0707-1556`）。
- **Scenario ID**: 適用された検証シナリオのID（例: `SCN-NORMAL-001`）。
- **Start Time**: シミュレーション検証が開始された日時（ISO 8601）。
- **End Time**: シミュレーション検証が終了した日時（ISO 8601）。
- **Result**: 検証結果の最終判定。
- **Failed Layer**: スキーマ検証（Contract Verification）またはデータフローで不整合を起こした模擬レイヤーの名前（例: `Mock Governance`）。
- **Error**: 発生したエラーコード、エラーメッセージの詳細。
- **Audit Reference**: 対応する `Simulation Audit` の監査ログエントリのID、またはファイルパス参照。

---

## 検証判定ステータス (Result Statuses)

| 判定ステータス | 解説 |
|---|---|
| **Passed (合格)** | すべての模擬レイヤー間データ受け渡しにおいて、接続スキーマおよび契約（Contract）を100%満たした状態。 |
| **Failed (不合格)** | いずれかのレイヤー接続において、必須フィールドの不足、型不整合、または処理例外が発生した状態。 |
| **Warning (警告あり)** | 基本的な接続契約は満たしているが、過渡期の Deprecated ポリシー違反や一時遅延等がシミュレートされた状態。 |

---

## シミュレーション結果データ構造 (Simulation Result Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SimulationResultRecord",
  "type": "object",
  "properties": {
    "simulationId": { "type": "string" },
    "scenarioId": { "type": "string" },
    "startTime": { "type": "string", "format": "date-time" },
    "endTime": { "type": "string", "format": "date-time" },
    "result": {
      "type": "string",
      "enum": ["Passed", "Failed", "Warning"]
    },
    "failedLayer": { "type": "string", "default": "" },
    "error": {
      "type": "object",
      "properties": {
        "code": { "type": "string" },
        "message": { "type": "string" }
      }
    },
    "auditReference": { "type": "string" }
  },
  "required": ["simulationId", "scenarioId", "startTime", "endTime", "result", "auditReference"]
}
```
