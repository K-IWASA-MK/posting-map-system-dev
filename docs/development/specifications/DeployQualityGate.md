# デプロイ品質ゲート仕様書 (Deploy Quality Gate Specification)

## 目的
開発者またはフックにより `clasp push` やリリース、プロダクション環境へのデプロイ操作が要求された際、その前段でシミュレーションテストを自動実行し、品質適合（Quality Gate PASS）を強制（条件適用）することで不完全なコードの配信を自動で阻止するための検証モデルを規定する。

---

## デプロイ合否判断の条件 (Deploy Gate Rules)
デプロイ品質ゲートは、以下のルールに基づいて決定論的にデプロイの可否（Allow / Block）を判断する。

- **シミュレーションテスト合格の必須化 (Simulation Test PASS Required)**:
  - デプロイを実行するためには、`SimulationTestRunner` による自動テスト結果がすべて PASS であり、Quality Gate が合格状態であることが必要条件（必須条件）となる。
- **デプロイ阻止（Block）条件**:
  - いずれか 1 件でも契約破壊（Schema不整合）や隔離違反（Boundary Failure）が検出された場合、デプロイゲートは即座にステータスを `Blocked` に設定し、デプロイ処理の実行そのものを強制的に遮断する（Exit Code != 0）。

---

## デプロイ検証データモデル (Deploy Gate Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DeployQualityGateRecord",
  "type": "object",
  "properties": {
    "testRunId": { "type": "string" },
    "hookId": { "type": "string" },
    "targetEnvironment": { "type": "string", "default": "Staging/Production" },
    "status": {
      "type": "string",
      "enum": ["Pending", "Running", "Passed", "Blocked"]
    },
    "timestamp": { "type": "string", "format": "date-time" }
  },
  "required": ["testRunId", "hookId", "status", "timestamp"]
}
```
