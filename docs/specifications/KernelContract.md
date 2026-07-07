# カーネル間契約仕様書 (Kernel Contract Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、各カーネルレイヤー（Execution, Review, Quality, Governance 等）が結合する接続境界でのデータの入出力形式（スキーマ）を不変の契約（Contract）として定義し、一部モジュールのリファクタリングや機能改変に伴う「システム全体の接続破壊（Breaking Changes）」を決定論的に防止する。

---

## 契約定義項目 (Contract Fields)
各カーネル接続点には、以下の契約が適用され、バリデーターによって厳格に監査される。

- **Input Schema**: 受け入れ可能な入力データの JSON Schema 定義。
- **Output Schema**: 出力するデータの JSON Schema 定義。
- **Required Fields**: 正常な結合に必要な必須キーの定義（例: `QualityScore` における `overallScore` 等）。
- **Version**: 接続インターフェースのバージョン（セマンティックバージョニング形式: `v1.0.0`）。
- **Compatibility Rule (互換性ルール)**:
  - インターフェース変更時、新バージョンが旧バージョンの必須フィールドを削除するなどの「破壊的変更」を行う場合は、メジャーバージョンを上げなければならない。
  - マイナー/パッチ更新時は、常に下位互換性（Backward Compatibility）を保証しなければならない。

---

## 契約適用モデル (Contract Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "KernelContractRecord",
  "type": "object",
  "properties": {
    "contractId": { "type": "string" },
    "layerConnection": {
      "type": "string",
      "description": "接続ペアを示す（例: 'Review->Quality'）。"
    },
    "version": { "type": "string" },
    "inputSchemaRef": { "type": "string", "description": "入力スキーマファイルへのリファレンス。" },
    "outputSchemaRef": { "type": "string", "description": "出力スキーマファイルへのリファレンス。" },
    "compatibilityMode": {
      "type": "string",
      "enum": ["Strict", "BackwardCompatible", "None"]
    }
  },
  "required": ["contractId", "layerConnection", "version", "inputSchemaRef", "outputSchemaRef", "compatibilityMode"]
}
```
