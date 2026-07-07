# コミット品質ゲート仕様書 (Commit Quality Gate Specification)

## 目的
開発者がローカル環境で `git commit` 操作を実行した際、変更されたコードの接続契約適合性や隔離境界をコミット確定前に検証し、不適合なコードの記録を自動で防ぐための検証ライフサイクルおよび合否ステータスモデルを規定する。

---

## ステータス定義 (Commit Gate Statuses)
コミット品質ゲートの検証状態は、以下のいずれかの状態で決定論的に管理される。

| 検証ステータス | 定義 |
|---|---|
| **Pending (検証待ち)** | コード変更が検知され、フックがトリガーされるのを待機している状態。 |
| **Running (検証実行中)** | フックによって `SimulationTestRunner` が起動され、テストスイート（アサーション）を現在実行している状態。 |
| **Passed (合格・許可)** | すべてのテスト（Boundary, Contract, Scenario）に合格し、コミットの続行が正式に許可された状態（Exit Code = 0）。 |
| **Blocked (不合格・阻止)** | いずれかの検証項目で FAIL が検出され、コミット操作が即座に中断・拒否された状態（Exit Code != 0）。 |

---

## コミット検証データモデル (Commit Gate Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CommitQualityGateRecord",
  "type": "object",
  "properties": {
    "testRunId": { "type": "string" },
    "hookId": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["Pending", "Running", "Passed", "Blocked"]
    },
    "failureDetails": {
      "type": "object",
      "properties": {
        "failedTestCase": { "type": "string" },
        "message": { "type": "string" }
      }
    },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "required": ["testRunId", "hookId", "status", "timestamp"]
}
```
