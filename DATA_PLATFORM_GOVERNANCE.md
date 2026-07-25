# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 4.0 (全国289選挙区展開用・究極アーキテクチャ)  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS / 289 DISTRICT EXPANSION ENGINE  

---

## ■ 最重要原則: 全国住所データ基盤 第一原則 (National Address Platform Prerequisite)
```
┌─────────────────────────────────────────────────────────────┐
│ いきなり特定選挙区 (例: MIE-03) の抽出に入ってはならない。      │
│ まず【全国住所データ基盤 (STEP 0)】を完全構築し、             │
│ 全国住所マスター (NATIONAL_ADDRESS_MASTER.csv) を完成させてから │
│ 初めて選挙区境界データを重ね合わせる。                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ■ 全国 289 選挙区展開用・9 段階不可逆データ生成フロー

```
[STEP 0]   全国住所データ基盤構築 (National Address Platform) ★最初
           ├─ ① 日本郵便 全国郵便データ取り込み (utf_ken_all.csv)
           ├─ ② SHA-256 ガバナンス管理 (data/raw/postal/raw_hash.json)
           ├─ ③ Rule v3 全国住所階層解析 (都道府県/自治体/第1階層/第2階層)
           └─ ④ 全国住所マスター完成 (data/master/NATIONAL_ADDRESS_MASTER.csv)
              │
              ▼
[STEP 0.5] 自治体分割リスク判定 (Municipality Split Risk Analysis)
              │
              ▼
[Gate 0]   Boundary Confirmation Gate (リスク検知通過)
              │
              ▼
[STEP 1]   選挙区境界判定 (Boundary Resolution)
              │
              ▼
[STEP 1.5] 境界証明ゲート (Boundary Evidence Gate: 包含/除外地域証明)
              │
              ▼
[STEP 2]   対象地域確定 (Target Area Determination)
              │
              ▼
[STEP 3]   FINAL CSV Generator (SSOT確定CSV生成・郵便番号昇順)
              │
              ▼
[STEP 4]   CSV Accuracy Verification (精度検証)
              │
              ▼
[STEP 5]   CEO Data Acceptance Gate (データ承認ゲート)
              │
              ▼
[STEP 6]   Google Spreadsheet Generator (表示専用レイヤー)
```

---

## ■ 新規モジュール群 (`src/platform/address-data-platform/`)

1. **`PostalCsvIngestor.ts`**: 日本郵便全データ取り込み & `raw_hash.json` 保持
2. **`AddressHierarchyParser.ts`**: Rule v3 全国住所階層分解器
3. **`AddressMasterGenerator.ts`**: `NATIONAL_ADDRESS_MASTER.csv` 出力
4. **`NationalAddressPipeline.ts`**: 全国パイプライン統制器
5. **`test_national_address_pipeline.ts`**: 単体テストスイート (100% PASS)
