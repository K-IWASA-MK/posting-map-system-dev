# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 5.0 (全国289選挙区展開用・全国住所データ基盤原則)  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS / NATIONAL ADDRESS PLATFORM ENGINE  

---

## ■ 最重要原則: 全国住所データ基盤構築 第一原則 (National Address Foundation Prerequisite)
```
┌─────────────────────────────────────────────────────────────┐
│ ❌ 先に MIE-03 や特定選挙区を作る                            │
│ ❌ 既存 CSV を正解扱いする                                   │
│ ❌ 郵便 CSV から直接エリア化する                              │
│                                                             │
│ ✅ 最新全国 Raw 取得 (日本郵便 KEN_ALL.CSV ＋ 行政マスター)    │
│ ✅ Raw Data Audit 実施 (raw_audit_manifest.json)            │
│ ✅ 全国住所階層 MASTER (ADDRESS_MASTER.csv) の作成            │
│ ✅ 全国 ADDRESS_MASTER 完成後に初めて選挙区境界を重ねる        │
└─────────────────────────────────────────────────────────────┘
```

---

## ■ 正式な 4 段階 全国住所データ基盤フロー

```
[STEP 1] 全国最新 Raw データ取得
         ├─ ① 日本郵便 全国郵便番号データ (最新 KEN_ALL.CSV / UTF-8版)
         └─ ② 行政住所マスターデータ (全国市区町村コード, 自治体名, 町名, 大字, 字, 丁目)
            (※ 日本郵便データ単体の不完全さを行政マスターで補強・完備)
            │
            ▼
[STEP 2] Raw Data Audit (raw/ 保持 & 証跡管理)
         ├─ raw/postal/KEN_ALL.CSV
         ├─ raw/administrative/national_address_master.csv
         └─ raw/raw_audit_manifest.json
            {"source": "...", "updatedAt": "...", "recordCount": "...", "sha256": "..."}
            │
            ▼
[STEP 3] 全国住所階層解析 (Rule v3 エンジン)
         ├─ 自治体名は階層に含めない (東員町1丁目 ➔ 自治体: 東員町, level1: 1丁目, level2: NULL)
         ├─ 成果物: data/master/ADDRESS_MASTER.csv
         └─ スキーマ: prefecture, municipality, address_level_1, address_level_2, postal_code, source, hash
            │
            ▼
[STEP 4] 全国 ADDRESS_MASTER 完成後
         └─ 全国 ADDRESS_MASTER ➔ 選挙区境界データ ➔ 対象自治体・地域抽出 ➔ POSTING MAP 確定 CSV
```

---

## ■ 新規構築モジュール群 (`src/platform/address-data-platform/`)

1. **`raw/RawDataIngestor.ts`**: KEN_ALL.CSV & 行政マスター取得・`raw_audit_manifest.json` (SHA-256) 監査
2. **`parser/NationalAddressHierarchyParser.ts`**: 自治体を階層から除外した Rule v3 解析器
3. **`generator/AddressMasterGenerator.ts`**: `ADDRESS_MASTER.csv` & `address_master_evidence.json` 出力
4. **`pipeline/NationalAddressDataPipeline.ts`**: 全国パイプライン統制器 (STEP 1 〜 STEP 4)
5. **`test_national_address_master_v4.ts`**: 単体テストスイート (**100% PASS**)
