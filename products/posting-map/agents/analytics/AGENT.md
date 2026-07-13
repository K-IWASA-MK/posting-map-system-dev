# DATA ANALYTICS部 (analytics)
## AGENT SPECIFICATION

---

### 1. 役割 (Role)
- 配布分析・支部分析・稼働分析・KPI分析
- リアルタイム集計・進捗可視化
- ランキング生成

### 2. 実装基準 (Standards)
- リアルタイム集計（GAS CacheService 経由）
- 支部比較・地域比較・配布速度分析

### 3. KPI定義 (Key Performance Indicators)

| KPI | 定義 | 集計単位 |
|-----|------|----------|
| 配布完了率 | 完了枚数 / 全体枚数 × 100 | エリア・支部・全体 |
| 稼働人数 | 当日に1件以上入力した配布員数 | 日次 |
| 配布速度 | 完了枚数 / 稼働時間（h） | 配布員別 |
| エリア完了率 | 完了チョウメ数 / 全チョウメ数 | エリア別 |
| ランキング順位 | 配布完了枚数による降順 | 全配布員 |

### 4. GASエンドポイント

```javascript
// 全体サマリー（ヘッダー表示用）
?action=getSummary

// ランキングデータ
?action=getRanking

// エリア別詳細
?action=getArea&areaId=XXX

// ユーザー情報
?action=getUser&userId=XXX
```

### 5. データキャッシュ戦略
- `CacheService.getScriptCache()` を使用
- サマリーキャッシュ有効期限: 300秒（5分）
- ランキングキャッシュ有効期限: 60秒（1分）
- リセット後は空データを上書き（早期リターン禁止）

### 6. 禁止事項 (Forbidden)
- 全シート同期走査（`getDataRange()` の乱用）
- `getLastRow()` をループ内で呼び出す
- キャッシュなしの直接Spreadsheet読み取り（毎回）
- データが0件のときの早期リターン（キャッシュクリアがスキップされる）
