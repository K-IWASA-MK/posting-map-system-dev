# 品質スコアスキーマ仕様書 (Score Schema Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、Quality Score Engine が出力する品質スコアデータの構造を決定論的かつ一貫性のある JSON Schema として定義する。

---

## 品質スコアスキーマ (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "QualityScoreSchema",
  "type": "object",
  "properties": {
    "overall": {
      "type": "object",
      "properties": {
        "score": { "type": "number", "minimum": 0, "maximum": 100 },
        "status": { "type": "string", "enum": ["PASS", "WARNING", "FAIL"] }
      },
      "required": ["score", "status"]
    },
    "architecture": { "$ref": "#/definitions/CategoryScore" },
    "product": { "$ref": "#/definitions/CategoryScore" },
    "humanEngineering": { "$ref": "#/definitions/CategoryScore" },
    "design": { "$ref": "#/definitions/CategoryScore" },
    "ux": { "$ref": "#/definitions/CategoryScore" },
    "runtime": { "$ref": "#/definitions/CategoryScore" },
    "output": { "$ref": "#/definitions/CategoryScore" },
    "aiSmell": { "$ref": "#/definitions/CategoryScore" }
  },
  "required": [
    "overall",
    "architecture",
    "product",
    "humanEngineering",
    "design",
    "ux",
    "runtime",
    "output",
    "aiSmell"
  ],
  "definitions": {
    "CategoryScore": {
      "type": "object",
      "properties": {
        "score": { "type": "number", "minimum": 0, "maximum": 100 },
        "weight": { "type": "number", "minimum": 0, "maximum": 1.0 },
        "status": { "type": "string", "enum": ["PASS", "WARNING", "FAIL"] },
        "priority": { "type": "string", "enum": ["P0", "P1", "P2", "P3"] },
        "reason": { "type": "string" },
        "confidence": { "type": "string", "enum": ["High", "Medium", "Low"] },
        "recommendation": { "type": "string" }
      },
      "required": ["score", "weight", "status", "priority", "confidence"]
    }
  }
}
```

---

## データ構造の具体例 (JSON Output Example)

```json
{
  "overall": {
    "score": 93.5,
    "status": "PASS"
  },
  "architecture": {
    "score": 100,
    "weight": 0.15,
    "status": "PASS",
    "priority": "P3",
    "reason": "レイヤー境界に違反なし",
    "confidence": "High",
    "recommendation": ""
  },
  "product": {
    "score": 95,
    "weight": 0.15,
    "status": "PASS",
    "priority": "P3",
    "reason": "仕様適合性良好",
    "confidence": "High",
    "recommendation": ""
  },
  "humanEngineering": {
    "score": 85,
    "weight": 0.15,
    "status": "PASS",
    "priority": "P2",
    "reason": "一部カードの視覚誘導がやや単調",
    "confidence": "Medium",
    "recommendation": "第0原則に基づき、送信ボタンのハイライトを強調してください"
  },
  "design": {
    "score": 90,
    "weight": 0.10,
    "status": "PASS",
    "priority": "P3",
    "reason": "デザイン適合性良好",
    "confidence": "High",
    "recommendation": ""
  },
  "ux": {
    "score": 92,
    "weight": 0.10,
    "status": "PASS",
    "priority": "P3",
    "reason": "UX要件クリア",
    "confidence": "High",
    "recommendation": ""
  },
  "runtime": {
    "score": 96,
    "weight": 0.10,
    "status": "PASS",
    "priority": "P3",
    "reason": "API接続最適化済み",
    "confidence": "High",
    "recommendation": ""
  },
  "output": {
    "score": 100,
    "weight": 0.10,
    "status": "PASS",
    "priority": "P3",
    "reason": "日本語化および構成統一ルール順守",
    "confidence": "High",
    "recommendation": ""
  },
  "aiSmell": {
    "score": 80,
    "weight": 0.15,
    "status": "WARNING",
    "priority": "P1",
    "reason": "AI Smell Level 1 (軽微な余白の不整合検出)",
    "confidence": "Low",
    "recommendation": "画面下部マージンが詰まっています。余白を広げてください。"
  }
}
```
