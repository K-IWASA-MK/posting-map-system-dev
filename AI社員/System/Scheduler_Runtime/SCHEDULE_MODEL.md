# Schedule Model & Trigger Evaluator Specification v1.0

---

## ■ Schedule Model
```json
{
  "scheduleId": "SCHED-0001",
  "scheduleName": "Daily Address Master Verification",
  "triggerType": "TIME",
  "targetEmployee": "AI-0002",
  "taskType": "ADDRESS_EXTRACTION_WORK",
  "requiredCapability": "ADDRESS_EXTRACTION",
  "targetArtifact": "master/address_database.json",
  "priority": "HIGH",
  "enabled": true,
  "triggerConfig": {
    "cron": "0 7 * * *"
  }
}
```

---

## ■ Trigger Types (Enum)
- `TIME`: 時刻一致
- `EVENT`: 正本 Artifact の Version / Checksum 変更検知
- `MANUAL`: 手動・管理者要求
