# ダッシュボード KPI スキーマ仕様書 (Dashboard KPI Schema Specification)

## 目的
AIOS Kernel Output とダッシュボードアダプター間で授受される各 KPI 情報の JSON レコードスキーマを規定する。

---

## 各 KPI スキーマの定義 (KPI Schema JSON Models)

### 1. Quality KPI (品質メトリクス)
```json
{
  "type": "object",
  "properties": {
    "qualityScore": { "type": "number" },
    "reviewCount": { "type": "integer" },
    "improvementDelta": { "type": "number" }
  },
  "required": ["qualityScore", "reviewCount", "improvementDelta"]
}
```

### 2. Knowledge KPI (ナレッジ管理メトリクス)
```json
{
  "type": "object",
  "properties": {
    "knowledgeTotal": { "type": "integer" },
    "officialCount": { "type": "integer" },
    "healthScore": { "type": "number" },
    "gapCount": { "type": "integer" },
    "mergeCandidates": { "type": "integer" }
  },
  "required": ["knowledgeTotal", "officialCount", "healthScore", "gapCount", "mergeCandidates"]
}
```

### 3. Governance KPI (ポリシー統制メトリクス)
```json
{
  "type": "object",
  "properties": {
    "pendingApproval": { "type": "integer" },
    "approvedCount": { "type": "integer" },
    "auditCount": { "type": "integer" }
  },
  "required": ["pendingApproval", "approvedCount", "auditCount"]
}
```

### 4. Billing KPI (契約ライセンスメトリクス)
```json
{
  "type": "object",
  "properties": {
    "licenseStatus": { "type": "string" },
    "subscriptionStatus": { "type": "string" }
  },
  "required": ["licenseStatus", "subscriptionStatus"]
}
```

### 5. Simulation KPI (シミュレーション検証メトリクス)
```json
{
  "type": "object",
  "properties": {
    "lastRun": { "type": "string", "format": "date-time" },
    "passed": { "type": "integer" },
    "failed": { "type": "integer" }
  },
  "required": ["lastRun", "passed", "failed"]
}
```
