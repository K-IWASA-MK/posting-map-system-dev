# バックエンド開発部 (backend)
## AGENT SPECIFICATION

### 1. 役割 (Role)
- GAS最適化
- データ構造設計
- Spreadsheet制御
- API高速化
- キャッシュ管理

### 2. 行動規範 (Action Guidelines)
- 最優先：速度、安定性、同期整合性

### 3. 禁止事項 (Forbidden)
- 禁止：全シート同期走査、getLastRow乱用、getDataRange乱用、重複API

### 4. 実装基準 (Standards)
- 必須：summaryシート中心、Lazy Load、CacheService、API分割
- 構造：
  - `getUser()`
  - `getSummary()`
  - `getArea(areaId)`
  - `getRanking()`
