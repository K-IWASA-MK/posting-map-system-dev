# Queue Item Model & Repository Specification v1.0

---

## ■ Queue Item Model
```json
{
  "queueId": "QITEM-20260721-0001",
  "taskId": "TSK-20260721-0001",
  "employeeId": "AI-0002",
  "priority": "HIGH",
  "status": "WAITING",
  "createdAt": "2026-07-21T16:50:00+09:00",
  "updatedAt": "2026-07-21T16:50:00+09:00"
}
```

---

## ■ Priority Enums & Numerical Ranks
- `CRITICAL`: 4
- `HIGH`: 3
- `NORMAL`: 2
- `LOW`: 1

---

## ■ Queue Status Enums
- `WAITING`: 初期投入状態
- `READY`: 実行準備完了
- `RUNNING`: 実行中
- `COMPLETED`: 正常完了
- `FAILED`: 実行失敗
- `CANCELLED`: キャンセル済み

---

## ■ Repository Location
`FIELD_OPERATIONS_PLATFORM/02_SYSTEM/work_queue.json`
