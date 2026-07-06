# Release Notes - v4.1-audit-data-integrity

## 🚀 New Features & Enhancements

### 1. Area Metadata Foundation v1 完成
- `cityKana` / `townKana` の Single Source of Truth (SSOT) 確立。
  - 生成責務を `v2_extract.gs` に一本化し、`v2_map.gs` における二重生成・CSV再解析を完全排除しました。
  - カナ情報を `__TEMP_ADDRESSES__` (一時マスタ) ➔ `__SYSTEM_CACHE__` ➔ `areaSummary` ➔ Hアプリの順に一貫して伝播するクリーンなデータフローを構築。
- `AreaSummary` API の JSON レスポンス仕様（`version: 1`, `cityKana`, `townKana`, `repAddress` 等）を固定化。
- 将来の `AreaID` / `District` / `Prefecture` 等の拡張に備えたロードマップ設計（v1, v2, v3）を整備。

### 2. Hアプリ（配布員アプリ）検索・五十音インデックス基盤完成
- `active/mobile/render.js` および `app.js` を刷新。
- 第1層（自治体一覧）における各自治体の所属エリア数（シート数）の動的集計・表示。
- 第2層（エリア一覧）上部への「🔍 エリア検索窓」および「あ〜わ」の五十音インデックスボタンパネルの追加。
- サーバー通信を発生させずにメモリ上で即座にフィルタリングする `renderFilteredAreaList()` による爆速のUI応答性能を確保。

### 3. Audit OS v3.2（Data Integrity Audit）実装・検証完了
- `active/gas/v2_kernel.gs` (Version 3.2) におけるデータ整合性監査（Data Integrity Audit）の実装。
- 各工程（EXTRACT ➔ BATCH ➔ CACHE ➔ API）のタイミングにおいて、以下の論理的整合性をインメモリで検証し、`02_SYSTEM` フォルダへ `AUDIT_DATA_*.json` を自動保存する仕組みを統合。
  - **Sort Integrity (`auditSortIntegrity`)**: カナ順ソートの維持検証。
  - **Metadata Integrity (`auditMetadataIntegrity`)**: 必須カナ項目およびバージョン欠損の検出。
  - **Count Integrity (`auditCountIntegrity`)**: ステージ間におけるデータ件数ズレの検証。
  - **Hash Integrity (`auditHashIntegrity`)**: 改ざん検知用のステージ固有正規化ハッシュ比較検証。
  - **Schema Integrity (`auditSchemaIntegrity` - 予約実装)**: 将来のスキーマ拡張に追従する監査プレースホルダー。
- リセット（`deleteAllAreaSheets`）実行時に「チラシ保管庫」シートのデータ行も自動初期化（クリア）する安全なリセットポリシーを統合。

---

## 🐛 Bug Fixes
- **郵便番号ソート問題の解消**: `v2_batch.gs` の `forceStartBatch()` 内で SSOT 五十音ソート順を上書き破壊していた `addresses.sort()` 処理を完全に削除し、五十音順でのエリアシート生成順序を保護しました。
