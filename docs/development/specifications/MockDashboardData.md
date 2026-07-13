# モックダッシュボードデータ仕様書 (Mock Dashboard Data Specification)

## 目的
UIの描画テスト用として使用するダッシュボード状態モックJSONレコード（`mock_dashboard_data.json`）の構造定義および検証用スキーマを規定する。

---

## モックデータ構造定義 (Mock JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MockDashboardData",
  "type": "object",
  "properties": {
    "kernelStatus": {
      "type": "object",
      "properties": {
        "execution": { "type": "string", "enum": ["Active", "Idle", "Warning", "Error", "Disabled"] },
        "review": { "type": "string", "enum": ["Active", "Idle", "Warning", "Error", "Disabled"] },
        "quality": { "type": "string", "enum": ["Active", "Idle", "Warning", "Error", "Disabled"] },
        "learning": { "type": "string", "enum": ["Active", "Idle", "Warning", "Error", "Disabled"] },
        "governance": { "type": "string", "enum": ["Active", "Idle", "Warning", "Error", "Disabled"] },
        "billing": { "type": "string", "enum": ["Active", "Idle", "Warning", "Error", "Disabled"] },
        "simulation": { "type": "string", "enum": ["Active", "Idle", "Warning", "Error", "Disabled"] }
      },
      "required": ["execution", "review", "quality", "learning", "governance", "billing", "simulation"]
    },
    "quality": {
      "type": "object",
      "properties": {
        "overallScore": { "type": "number" },
        "reviewResult": { "type": "string", "enum": ["PASS", "FAIL"] },
        "selfReviewResult": { "type": "string", "enum": ["Passed", "Failed"] },
        "improvementDelta": { "type": "number" }
      },
      "required": ["overallScore", "reviewResult", "selfReviewResult", "improvementDelta"]
    },
    "knowledge": {
      "type": "object",
      "properties": {
        "totalKnowledge": { "type": "integer" },
        "officialCount": { "type": "integer" },
        "candidateCount": { "type": "integer" },
        "healthScore": { "type": "number" },
        "gapCount": { "type": "integer" }
      },
      "required": ["totalKnowledge", "officialCount", "candidateCount", "healthScore", "gapCount"]
    },
    "governance": {
      "type": "object",
      "properties": {
        "pendingApproval": { "type": "integer" },
        "approved": { "type": "integer" },
        "rejected": { "type": "integer" },
        "auditCount": { "type": "integer" }
      },
      "required": ["pendingApproval", "approved", "rejected", "auditCount"]
    },
    "billing": {
      "type": "object",
      "properties": {
        "licenseStatus": { "type": "string", "enum": ["Authorized", "Unauthorized"] },
        "subscriptionStatus": { "type": "string", "enum": ["active", "canceled", "past_due"] },
        "paymentEventStatus": { "type": "string", "enum": ["Succeeded", "Failed", "Pending"] }
      },
      "required": ["licenseStatus", "subscriptionStatus", "paymentEventStatus"]
    },
    "simulation": {
      "type": "object",
      "properties": {
        "lastSimulationResult": { "type": "string", "enum": ["Passed", "Failed", "Warning"] },
        "qualityGateResult": { "type": "string", "enum": ["PASS", "FAIL"] },
        "scenarioStatus": { "type": "string" }
      },
      "required": ["lastSimulationResult", "qualityGateResult", "scenarioStatus"]
    }
  },
  "required": ["kernelStatus", "quality", "knowledge", "governance", "billing", "simulation"]
}
```
