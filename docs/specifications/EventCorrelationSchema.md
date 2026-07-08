# Event Correlation Schema Specification (EventCorrelationSchema.md)

## 1. コレレーション・データモデル (Correlation Data Model)
相関チェーン（Correlation Chain）として保持されるデータモデルは、以下のスキーマ構造を厳守する。

```json
{
  "correlationId": "string",
  "eventIds": ["string"],
  "category": "string",
  "timeRange": "string",
  "relationType": "string"
}
```

### スキーマプロパティ詳細
* **correlationId**: 相関関係を一意に識別するユニークな ID。
* **eventIds**: 結合されているイベント（eventId）の配列（順序は時系列昇順）。
* **category**: 関係する主カテゴリ（例: `runtime`, `quality` 等）。
* **timeRange**: チェーンの開始から終了までの時間範囲（例: "10:30:15 - 10:32:00"）。
* **relationType**: 以下の固定値のいずれか（Unknown や独自因果タイプの追加は禁止）。
  * `TEMPORAL_SEQUENCE` (時間的連続)
  * `CATEGORY_GROUP` (カテゴリ共通)
  * `SOURCE_GROUP` (ソース共通)

---

## 2. スキーマ不変性と操作制約
- **Immutable (不変保護)**:
  生成・格納された相関チェーンオブジェクトは、`Object.freeze` により完全に不変保護される。登録後のプロパティの書き換え・追加・変更は不可。
- **No Mutation & Append-only**:
  ストア（`DashboardEventCorrelationStore`）への操作は、追加（add）および全クリア（clear）のみであり、個別の部分更新（Mutation）は行わない。
