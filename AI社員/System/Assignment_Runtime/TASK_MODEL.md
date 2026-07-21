# Task Model & Assignment Result Specification v1.0

---

## ■ Task Model (仕事単位)
```json
{
  "taskId": "TSK-20260721-0001",
  "taskType": "ADDRESS_EXTRACTION_WORK",
  "assignedTo": "AI-0002",
  "requestedBy": "AI-0001",
  "priority": "HIGH",
  "requiredCapability": "ADDRESS_EXTRACTION",
  "targetArtifact": "master/address_database.json",
  "inputArtifacts": [
    "master/district_profile.json",
    "NATIONAL_ADDRESS_MASTER"
  ],
  "expectedArtifacts": [
    "master/address_database.json"
  ],
  "status": "PENDING",
  "createdAt": "2026-07-21T16:47:00+09:00"
}
```

---

## ■ Assignment Result (結果報告)
```json
{
  "taskId": "TSK-20260721-0001",
  "assignedEmployee": "AI-0002",
  "assignmentStatus": "SUCCESS",
  "reason": "Capability matched and Ownership verified.",
  "assignedAt": "2026-07-21T16:47:05+09:00"
}
```
