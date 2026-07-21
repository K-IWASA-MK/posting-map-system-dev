# Workflow Model & Dependency Resolution Specification v1.0

---

## ■ Workflow Model
```json
{
  "workflowId": "WF-DISTRICT-SETUP-001",
  "workflowName": "District End-to-End Setup Pipeline",
  "version": "1.0.0",
  "enabled": true,
  "steps": [
    {
      "stepId": "STEP-001",
      "employeeId": "AI-0001",
      "taskType": "DISTRICT_INITIALIZATION_WORK",
      "requiredCapability": "DISTRICT_INITIALIZATION",
      "targetArtifact": "master/district_profile.json",
      "priority": "HIGH",
      "dependsOn": [],
      "producedArtifacts": ["master/district_profile.json"]
    },
    {
      "stepId": "STEP-002",
      "employeeId": "AI-0002",
      "taskType": "ADDRESS_EXTRACTION_WORK",
      "requiredCapability": "ADDRESS_EXTRACTION",
      "targetArtifact": "master/address_database.json",
      "priority": "HIGH",
      "dependsOn": ["STEP-001"],
      "producedArtifacts": ["master/address_database.json"]
    },
    {
      "stepId": "STEP-003",
      "employeeId": "AI-0003",
      "taskType": "SPREADSHEET_GENERATION_WORK",
      "requiredCapability": "SPREADSHEET_GENERATION",
      "targetArtifact": "output/district_summary.csv",
      "priority": "NORMAL",
      "dependsOn": ["STEP-002"],
      "producedArtifacts": ["output/district_summary.csv"]
    },
    {
      "stepId": "STEP-004",
      "employeeId": "AI-VAL-0001",
      "taskType": "ACCEPTANCE_VALIDATION_WORK",
      "requiredCapability": "ACCEPTANCE_INSPECTION",
      "targetArtifact": "logs/acceptance_report.json",
      "priority": "CRITICAL",
      "dependsOn": ["STEP-003"],
      "producedArtifacts": ["logs/acceptance_report.json"]
    }
  ]
}
```

---

## ■ Workflow State Enums
- `CREATED`: ワークフロー定義完了
- `RUNNING`: ステップ進行中
- `WAITING`: 前提条件完了待ち
- `COMPLETED`: 全ステップ完了
- `FAILED`: 依存ステップ失敗による失敗
