# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 6.0 (全国289選挙区展開用・全国ADDRESS_MASTER精度検証層完全版)  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS / ADDRESS MASTER ACCURACY VERIFICATION ENGINE  

---

## ■ 最重要原則: 全国 ADDRESS_MASTER 精度検証層 第一原則 (Accuracy Verification Prerequisite)
```
┌─────────────────────────────────────────────────────────────┐
│ 全国 ADDRESS_MASTER の生成後、直ちに選挙区処理に進んではならない。│
│ 【STEP 5: 全国 ADDRESS_MASTER 品質検証層】を挟み、          │
│ 件数・階層欠損・重複・表記揺れ・再生成証跡 (SHA-256) を       │
│ 100% 検証・証明してから初めて選挙区境界データを重ねる。       │
└─────────────────────────────────────────────────────────────┘
```

---

## ■ 正式な 5 段階 全国住所データ基盤 & 精度検証フロー

```
[STEP 1] 全国最新 Raw データ取得
         ├─ ① 日本郵便 全国郵便番号データ (最新 KEN_ALL.CSV / UTF-8版)
         └─ ② 行政住所マスターデータ (全国市区町村コード, 自治体名, 町名, 大字, 字, 丁目)
            │
            ▼
[STEP 2] Raw Data Audit (raw/ 保持 & SHA-256 証跡管理)
         ├─ raw/postal/KEN_ALL.CSV
         ├─ raw/administrative/national_address_master.csv
         └─ raw/raw_audit_manifest.json
            │
            ▼
[STEP 3] 全国住所階層解析 (Rule v3 エンジン / 自治体名は階層に含まない)
         ├─ 東員町1丁目 ➔ 自治体: 東員町, address_level_1: 1丁目, address_level_2: NULL
         ├─ 桑名市江場1丁目 ➔ 自治体: 桑名市, address_level_1: 江場, address_level_2: 1丁目
         └─ 成果物: data/master/ADDRESS_MASTER.csv
            │
            ▼
[STEP 4] ADDRESS_MASTER.csv & SHA-256 マニフェスト生成
            │
            ▼
[STEP 5] 全国 ADDRESS_MASTER 品質検証層 (Address Master Accuracy Verification) ★ここを追加
         ├─ ① 全国総レコード数確認 (totalRecords)
         ├─ ② 階層欠損確認 (missingLevel1Count === 0 証明)
         ├─ ③ 複合キー重複確認 (duplicateCount 検出)
         ├─ ④ 表記揺れ統一 (全角数字・漢数字 ➔ 半角数字正規化)
         └─ ⑤ 再生成証明 (Raw Hash ➔ ADDRESS_MASTER Hash の不可逆系譜証跡)
            (address_master_accuracy_verification.json 出力)
            │
            ▼ (検証 PASS 後、初めて選挙区境界データを重ねる)
[STEP 6] 全国 ADDRESS_MASTER ＋ 小選挙区境界 MASTER ➔ Boundary Resolver ➔ MIE-03 FINAL CSV
```

---

## ■ 新規構築モジュール群 (`src/platform/address-data-platform/`)

1. **`raw/RawDataIngestor.ts`**: KEN_ALL.CSV & 行政マスター取得・`raw_audit_manifest.json` (SHA-256) 監査
2. **`parser/NationalAddressHierarchyParser.ts`**: 自治体を階層から除外した Rule v3 解析器
3. **`generator/AddressMasterGenerator.ts`**: `ADDRESS_MASTER.csv` & `address_master_evidence.json` 出力
4. **`verifier/AddressMasterVerifier.ts`**: STEP 5 精度検証エンジン (欠損/重複/表記揺れ正規化/系譜証明)
5. **`pipeline/NationalAddressDataPipeline.ts`**: 全国 5 段階パイプライン統制器
6. **`test_address_master_accuracy_verifier.ts`**: STEP 5 検証スイート (**100% PASS**)
