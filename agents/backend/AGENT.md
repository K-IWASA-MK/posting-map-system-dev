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

### 5. パフォーマンス & デプロイ基準 (Performance & Deployment Guidelines)
- **一時シートによるCSVキャッシュ**:
  - 毎回巨大な郵便番号CSVを展開するとタイムアウトを起こすため、最初の1回だけCSVをパースし、非表示の一時シート（例: `__TEMP_ADDRESSES__`）にソート保存してロードする設計を標準とする。
- **キャッシュ消去の確実性**:
  - `refreshAreaSummaryCache` などのキャッシュ更新において、データが0件（リセット後）のときに早期リターンせず、空の状態をグローバルキャッシュ（`CacheService`, `PropertiesService`）に確実に上書き保存して、フロント側とスプシ側の状態を同期させる。
- **claspデプロイの必須手順**:
  - GASコードを変更し `clasp push` した後は、本番用 Webアプリ を更新するために必ず `npx clasp deploy -i <deployment_id>` を実行すること。
