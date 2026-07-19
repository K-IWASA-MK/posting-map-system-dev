# WORKFLOW.md - 業務フロー定義 (Operational Workflow)

## ■ 業務フロー一覧

### 1. 起動フェーズ (Initialization Trigger)
- 全体統制の `01_District_Initialization_Agent` より初期化指示を受信。
- 入力引数の `districtName` （例: `"埼玉県第8区"`) を検証し、処理を開始する。

### 2. 地区マスタ情報・ID決定フェーズ (District Resolution)
- 指定された選挙区名から都道府県と番号を分析。
- ローマ字小文字表記とハイフン付きのID（例: `saitama-08`）を一意に同定する。

### 3. 自治体構成抽出フェーズ (Municipal Sourcing)
- 全国都道府県市区町村マスタおよび区割り変更公告を参照。
- 選挙区に対応する自治体名を漏れなく紐解く。
  - *例: 「埼玉県第8区」➔ 「所沢市」「ふじみ野市（ただし旧大井町地区等一部または全体など区割り法に準拠）」「入間郡三芳町」*。

### 4. 自治体コードマッピングフェーズ (Code Mapping)
- 抽出した各自治体の5桁の地方公共団体コード（JISコード）を取得。
  - `所沢市` ➔ `11208`
  - `ふじみ野市` ➔ `11245`
  - `三芳町` ➔ `11324`

### 5. Rawデータ出力・検証フェーズ (Serialization & Validation)
- 取得した基本情報、自治体コードマッピングリストを結合し、`raw-district.json` へ出力。
- データの整合性検証（全自治体コードが実在するか、IDフォーマットが正しいか等）を検証エンジンへ委託。
- `01_District_Initialization_Agent` へ結果を返却し、業務を引き継ぐ。

---

## ■ 業務進捗ログフォーマット (Standard Output Logs)

業務実行時のログは以下の標準フォーマットに準拠すること：
```
[02_District_Data_Acquisition_Agent] Starting data acquisition for: 埼玉県第8区
[02_District_Data_Acquisition_Agent] District ID resolved: saitama-08
[02_District_Data_Acquisition_Agent] Resolving municipalities...
  - [11208] 所沢市 (Sourced)
  - [11245] ふじみ野市 (Sourced)
  - [11324] 三芳町 (Sourced)
[02_District_Data_Acquisition_Agent] Validation PASSED.
[02_District_Data_Acquisition_Agent] Successfully saved Raw District Data to storage.
```
