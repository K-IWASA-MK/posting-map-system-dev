# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 10.0 (全国289選挙区展開用・Area Generation Foundation 完全決定論的統合版)  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS / AREA GENERATION ENGINE  

---

## ■ 最重要原則: エリア生成 & エリア精度検証 第一原則 (Area Generation Prerequisite)
```
┌─────────────────────────────────────────────────────────────┐
│ ❌ 郵便 CSV から直接エリア化する                              │
│ ❌ 旧 CSV や過去の件数 (651件等) から逆算する                  │
│                                                             │
│ ✅ RELEASED ADDRESS_MASTER (STEP 6 承認) ＋                  │
│ ✅ VERIFIED Boundary Master (STEP 8 境界精度検証 PASS)       │
│ ➔ 【STEP 9: Area Generation Engine】で FINAL_AREA.csv を生成   │
│ ➔ 【STEP 9-2: Area Accuracy Verifier】で郵便番号昇順・一意性を検証│
│ ➔ 検証 PASS 後に初めてスプレッドシート表示レイヤーへ転送する  │
└─────────────────────────────────────────────────────────────┘
```

---

## ■ 正式な 9 段階 不可逆プラットフォーム フロー

```
[STEP 1] 全国最新 Raw データ取得 (KEN_ALL.CSV ＋ 行政マスター)
   │
[STEP 2] Raw Data Audit (raw_audit_manifest.json SHA-256)
   │
[STEP 3] 全国住所階層解析 (Rule v3 Engine / 自治体を階層から除外)
   │
[STEP 4] ADDRESS_MASTER.csv & SHA-256 マニフェスト生成
   │
[STEP 5] 全国 ADDRESS_MASTER 品質検証層 (欠損0件証明・安全表記揺れ統一)
   │
[STEP 6] Address Master Release Gate ➔ 【RELEASED】承認
   │
[STEP 7] Boundary Master Foundation (RELEASED ADDRESS_MASTER ＋ 行政区割り)
   │
[STEP 8] Boundary Master Accuracy Verification Foundation (4大境界検証 PASS)
   │
   ▼ (RELEASED 住所 ＋ 検証済み境界 のみエリア化を解禁)
[STEP 9-1] Area Generation Engine ★新規実装
         ├─ 決定論的 area_id 発番 (`MIE03-000001` ~ `MIE03-000684`)
         ├─ 郵便番号昇順ソート
         └─ 成果物: output/{districtId}_FINAL_VERIFIED_AREAS.csv & area_generation_{districtId}_manifest.json
   │
[STEP 9-2] Area Accuracy Verification Engine ★新規実装
         ├─ ① area_id 重複 0 件検証 (`duplicateAreaIdCount === 0`)
         ├─ ② 郵便番号昇順ソート検証 (`postalCodeAscendingPass === true`)
         └─ ③ SHA-256 ファイル整合性検証
            (output/area_accuracy_{districtId}_report.json 出力)
   │
   ▼ (エリア精度検証 PASS 後に初めてスプレッドシート化)
[SPREADSHEET] Google Spreadsheet 表示レイヤー化 (`MIE-03_DATA_ACCEPTANCE_REVIEW`)
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
8. **`area/AreaGenerator.ts`**: STEP 9-1 確定 SSOT CSV エリア生成エンジン
9. **`area/AreaAccuracyVerifier.ts`**: STEP 9-2 エリア精度検証エンジン
10. **`pipeline/NationalAddressDataPipeline.ts`**: 9 段階統制パイプライン
11. **`test_area_generation_foundation.ts`**: STEP 9 テストスイート (**100% PASS**)
