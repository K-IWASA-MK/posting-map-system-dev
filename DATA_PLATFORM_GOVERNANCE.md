# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 9.0 (全国289選挙区展開用・Boundary Master Accuracy Verification Foundation 完全統合版)  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS / BOUNDARY MASTER VERIFICATION ENGINE  

---

## ■ 最重要原則: 選挙区境界精度検証層 第一原則 (Boundary Verification Prerequisite)
```
┌─────────────────────────────────────────────────────────────┐
│ 住所基盤 (ADDRESS_MASTER) と 選挙区境界を統合した後、          │
│ 直ちに FINAL CSV 生成へ進んではならない。                    │
│ 【STEP 8: Boundary Master Accuracy Verification Foundation】│
│ を挟み、① 自治体包含、② 分割自治体差分 (四日市市第2区除外)、│
│ ③ 未所属住所 0 件証明、④ 二重所属 0 件証明 の 4 大検証を      │
│ 100% クリアしてから初めて POSTING MAP AREA CSV を生成する。 │
└─────────────────────────────────────────────────────────────┘
```

---

## ■ 正式な 8 段階 不可逆プラットフォーム フロー

```
[STEP 1] 全国最新 Raw データ取得 (日本郵便 KEN_ALL.CSV ＋ 行政住所マスター)
            │
            ▼
[STEP 2] Raw Data Audit (raw/ 保持 & SHA-256 証跡管理 `raw_audit_manifest.json`)
            │
            ▼
[STEP 3] 全国住所階層解析 (Rule v3 エンジン / 自治体名は階層に含まない)
            │
            ▼
[STEP 4] ADDRESS_MASTER.csv & SHA-256 マニフェスト生成
            │
            ▼
[STEP 5] 全国 ADDRESS_MASTER 品質検証層 (欠損0件証明・安全表記揺れ統一)
            │
            ▼
[STEP 6] Address Master Release Gate (状態遷移: GENERATED ➔ RELEASED)
            │
            ▼ (ステータスが RELEASED の場合のみ次段階を許可)
[STEP 7] Boundary Master Foundation (RELEASED ADDRESS_MASTER ＋ 行政区割り)
         ├─ Pattern A: 全域包含 (7 自治体)
         └─ Pattern B: 分割自治体 (四日市市) 包含/除外キーワード照合
            │
            ▼
[STEP 8] Boundary Master Accuracy Verification Foundation ★新規構築
         ├─ ① 自治体包含検証 (`ALL_MUNICIPALITIES_INCLUDED_PASS`)
         ├─ ② 分割自治体差分検証 (四日市市第2区 0% 混入遮断 `SPLIT_DIFFERENCE_EXACT_PASS`)
         ├─ ③ 未所属住所 0 件検証 (`unassignedAddressCount === 0`)
         └─ ④ 二重所属 0 件検証 (`dualAssignedCount === 0`)
            (boundary/boundary_accuracy_{districtId}_report.json 出力)
            │
            ▼ (境界検証 100% PASS のみ最終生成を解禁)
[POSTING MAP AREA CSV] 確定 SSOT CSV ➔ スプレッドシート表示レイヤー化
```

---

## ■ モジュール構造 (`src/platform/address-data-platform/`)

1. **`raw/RawDataIngestor.ts`**: KEN_ALL.CSV & 行政マスター取得・`raw_audit_manifest.json` SHA-256 監査
2. **`parser/NationalAddressHierarchyParser.ts`**: 安全な表記揺れ対応 Rule v3 解析器
3. **`generator/AddressMasterGenerator.ts`**: `ADDRESS_MASTER.csv` & `address_master_evidence.json` 出力
4. **`verifier/AddressMasterVerifier.ts`**: STEP 5 住所精度検証エンジン
5. **`gate/AddressMasterReleaseGate.ts`**: STEP 6 リリースゲート (`RELEASED` 承認)
6. **`boundary/BoundaryMasterFoundation.ts`**: STEP 7 選挙区境界統合エンジン
7. **`verifier/BoundaryMasterVerifier.ts`**: STEP 8 選挙区境界精度検証エンジン
8. **`pipeline/NationalAddressDataPipeline.ts`**: 8 段階統制パイプライン
9. **`test_boundary_master_accuracy_verifier.ts`**: STEP 8 テストスイート (**100% PASS**)
