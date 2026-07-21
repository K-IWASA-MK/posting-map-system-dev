# Input / Output Specification: Acceptance Validator AI

## 入力仕様 (Input Specification)
- **対象成果物パス**: Production AI が納品したディレクトリ
  (例: `FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/`)

---

## 出力仕様 (Acceptance Report Standard v1.0)

- **保存先**: `03_BRANCH/【都道府県】/【選挙区】/logs/acceptance_report.json`
- **形式**: JSON (Acceptance Report Standard v1.0 共通フォーマット)

### スキーマ定義 (JSON)

```json
{
  "agent": "District Initialization AI",
  "agentType": "Production",
  "validator": "Acceptance Validator AI",
  "validatorVersion": "1.0.0",
  "reportVersion": "1.0.0",
  "overallStatus": "SUCCESS",
  "gates": [
    {
      "gateId": "AG-001",
      "name": "Workspace Verification",
      "status": "PASS"
    },
    {
      "gateId": "AG-002",
      "name": "Artifact Verification",
      "status": "PASS"
    },
    {
      "gateId": "AG-003",
      "name": "Content Verification",
      "status": "PASS"
    },
    {
      "gateId": "AG-004",
      "name": "Evidence Verification",
      "status": "PASS"
    },
    {
      "gateId": "AG-005",
      "name": "Deterministic Verification",
      "status": "PASS"
    }
  ],
  "failures": [],
  "execution": {
    "startedAt": "2026-07-21T15:26:00+09:00",
    "finishedAt": "2026-07-21T15:26:30+09:00",
    "durationMs": 30000
  },
  "artifacts": [
    {
      "file": "source/district_municipalities.csv",
      "sha256": "7b670557ff0bce35e7d4773bac37911ac64a770bd20272ee912bd91fae542265"
    }
  ]
}
```

### 失敗（FAILED）時のフォーマット例 (構造化エラーコード必須)

```json
{
  "agent": "District Initialization AI",
  "agentType": "Production",
  "validator": "Acceptance Validator AI",
  "validatorVersion": "1.0.0",
  "reportVersion": "1.0.0",
  "overallStatus": "FAILED",
  "gates": [
    {
      "gateId": "AG-001",
      "name": "Workspace Verification",
      "status": "PASS"
    },
    {
      "gateId": "AG-002",
      "name": "Artifact Verification",
      "status": "PASS"
    },
    {
      "gateId": "AG-003",
      "name": "Content Verification",
      "status": "FAIL"
    }
  ],
  "failures": [
    {
      "gateId": "AG-003",
      "gate": "Content Verification",
      "code": "MUNICIPALITY_COUNT_MISMATCH",
      "message": "Expected 5 municipalities but found 4."
    }
  ],
  "execution": {
    "startedAt": "2026-07-21T15:26:00+09:00",
    "finishedAt": "2026-07-21T15:26:15+09:00",
    "durationMs": 15000
  },
  "artifacts": []
}
```
