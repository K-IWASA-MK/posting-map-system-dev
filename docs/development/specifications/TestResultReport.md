# テスト結果レポート仕様書 (Test Result Report Specification)

## 目的
ローカルシミュレーションテストを実行したサマリー結果（Test Result Report）のデータモデル、適合ステータス、および不適合追跡に必要なログモデルを定義する。

---

## テスト結果データモデル (Test Result Model)
各テスト実行完了時に出力されるレポートオブジェクトの構造。

- **Test Run ID**: テスト実行セッションに割り当てられる一意の識別ID（例: `TST-RUN-2026-0707-2210`）。
- **Scenario ID**: 実行されたテストシナリオのID。
- **Result**: テスト検証結果の最終ステータス。
- **Failure Reason**: テストが不合格（FAIL）となった原因、および不整合が発生した模擬モジュール名と検証エラー詳細。
- **Timestamp**: テスト実行完了の日時（ISO 8601）。
- **Audit Reference**: 対応する `Test Audit` の監査ログファイル、またはエントリー識別ID。

---

## テストステータス定義 (Test Statuses)

| 判定ステータス | 定義 |
|---|---|
| **PASS (合格)** | すべてのテストアサーション（契約、シナリオ、本番隔離、監査）を 100% 満たした状態。 |
| **FAIL (不合格)** | いずれかのテストで契約違反、本番隔離（Boundary）違反、または実行時エラーが発生した状態。 |
| **WARNING (警告あり)** | テスト自体は合格しているが、非推奨（Deprecated）のパラメータ使用や軽微なバージョン乖離が検知された状態。 |

---

## テスト結果レポートスキーマ (Test Report Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TestResultReportRecord",
  "type": "object",
  "properties": {
    "testRunId": { "type": "string" },
    "scenarioId": { "type": "string" },
    "result": {
      "type": "string",
      "enum": ["PASS", "FAIL", "WARNING"]
    },
    "failureReason": {
      "type": "object",
      "properties": {
        "failedLayer": { "type": "string" },
        "message": { "type": "string" }
      }
    },
    "timestamp": { "type": "string", "format": "date-time" },
    "auditReference": { "type": "string" }
  },
  "required": ["testRunId", "scenarioId", "result", "timestamp", "auditReference"]
}
```
