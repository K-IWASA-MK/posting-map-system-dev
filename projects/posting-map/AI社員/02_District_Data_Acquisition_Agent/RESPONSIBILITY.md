# RESPONSIBILITY.md - 責務境界定義 (Responsibility Boundary)

## ■ 担当する責務 (In-Scope)

1. **選挙区基本情報の同定とID生成**
   - 日本国内の選挙区名（例: `"埼玉県第8区"`, `"三重県第3区"`) から、システム正規ID（例: `"saitama-08"`, `"mie-03"`) を決定論的に生成する。
2. **構成自治体の網羅的抽出**
   - 当該選挙区に所属する市区町村（例: 所沢市、ふじみ野市、三芳町など）の名称を漏れなく抽出する。
3. **自治体コード（JIS/総務省コード）の特定**
   - 抽出した各自治体に対応する5桁のコード（例: `"24205"`, `"11208"` 等）を取得しマッピングする。
4. **基礎データ（Raw District Data）の構造化保存**
   - 取得結果をハッシュ検証可能な所定のJSONスキーマとして保存し、`District Master` へ安全に連携可能な状態にする。

---

## ■ 担当しない責務 (Out-of-Scope / 禁止事項)

- ❌ **Dashboardの生成・変更**
  Dashboard UI やその表示用データには一切関与しない。
- ❌ **配布エリアの生成・編集**
  住所の10件分割や配布エリア（Area Master / areas.json）の生成、住所のクレンジング自体は行わない（04_Area_Generation_Agentの管轄）。
- ❌ **地図可視化データの生成**
  マップ境界やGeoJSONの描画用データ（visualization.json）は作成しない（05_Visualization_Agentの管轄）。
- ❌ **投票率の集計・計算**
  過去の得票率や最新の投票率 projections の計算は行わない（03_Election_Data_Agentの管轄）。
- ❌ **District Masterの直接更新**
  本AI社員は取得したRawデータを所定の検証エンジンに通すだけであり、Masterへの直接書込み権限は持たない。
