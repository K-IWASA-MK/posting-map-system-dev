# Security Policy


## 禁止事項

Direct Access禁止


禁止:

Agent
 ↓
Database


Agent
 ↓
Spreadsheet


Agent
 ↓
File Modify


## 正式経路


Agent

↓

Runtime

↓

EventBus

↓

Domain


## Secret

禁止:

- API Key保持
- Token保持
- Credential保存


## Audit

全処理:

- traceId
- correlationId
- initializationId

を保持する。
