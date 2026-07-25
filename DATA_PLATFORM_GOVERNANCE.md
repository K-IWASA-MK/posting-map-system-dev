# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 7.0 (全国289選挙区展開用・Address Master Release Gate 完全対応版)  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS / NATIONAL ADDRESS PLATFORM ENGINE  

---

## ■ 最重要原則: Address Master Release Gate 第一原則 (Release Gate Prerequisite)
```
┌─────────────────────────────────────────────────────────────┐
│ ADDRESS_MASTER.csv を生成・精度検証しただけでは              │
│ 小選挙区処理 (Boundary Resolver) へ渡してはならない。          │
│ 【STEP 6: Address Master Release Gate】を通過し、            │
│ ライフサイクルステータスが【RELEASED】に変更されて初めて        │
│ 選挙区境界データの統合・Overlay が許可される。                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ■ 正式な 6 段階 全国住所データ基盤 & リリースゲート フロー

```
[STEP 1] 全国最新 Raw データ取得
         ├─ ① 日本郵便 全国郵便番号データ (KEN_ALL.CSV / UTF-8版)
         └─ ② 行政住所マスターデータ (全国市区町村コード, 自治体名, 町名, 大字, 字, 丁目)
            │
            ▼
[STEP 2] Raw Data Audit (raw/ 保持 & SHA-256 証跡管理)
         └─ raw_audit_manifest.json
            │
            ▼
[STEP 3] 全国住所階層解析 (Rule v3 エンジン / 自治体名は階層に含まない)
         ├─ 東員町1丁目 ➔ 自治体: 東員町, address_level_1: 1丁目, address_level_2: NULL
         └─ 桑名市江場1丁目 ➔ 自治体: 桑名市, address_level_1: 江場, address_level_2: 1丁目
            │
            ▼
[STEP 4] ADDRESS_MASTER.csv & SHA-256 マニフェスト生成
            │
            ▼
[STEP 5] 全国 ADDRESS_MASTER 品質検証層 (Address Master Accuracy Verification Engine)
         ├─ ① 全国総件数確認
         ├─ ② 階層欠損 0 件証明 (`missingLevel1Count === 0`)
         ├─ ③ 複合キー重複確認 & 同一住所複数郵便番号ノート記録
         ├─ ④ 安全な表記揺れ統一 (全角「１丁目」・漢数字「一丁目」➔ 「1丁目」/ 「一番町」誤変換防止)
         └─ ⑤ 再生成証明 (Raw Hash ➔ Parser Version ➔ Master Hash)
            │
            ▼
[STEP 6] Address Master Release Gate ★新規構築
         ├─ ステートマシン遷移:
         │  GENERATED ➔ VALIDATED ➔ ACCURACY_CHECKED ➔ AUDITED ➔ RELEASED
         └─ 成果物: master/address_master_release_manifest.json (RELEASED 証明)
            │
            ▼ (ステータスが RELEASED の場合のみ次段階を許可)
[STEP 7] 全国 ADDRESS_MASTER ＋ 小選挙区境界 MASTER ➔ Boundary Resolver ➔ MIE-03 FINAL CSV
```

---

## ■ モジュール群 (`src/platform/address-data-platform/`)

1. **`raw/RawDataIngestor.ts`**: KEN_ALL.CSV & 行政マスター取得・`raw_audit_manifest.json` SHA-256 監査
2. **`parser/NationalAddressHierarchyParser.ts`**: 安全な表記揺れ対応 Rule v3 解析器
3. **`generator/AddressMasterGenerator.ts`**: `ADDRESS_MASTER.csv` & `address_master_evidence.json` 出力
4. **`verifier/AddressMasterVerifier.ts`**: STEP 5 精度検証エンジン (安全置換/重複/複数郵便番号ノート)
5. **`gate/AddressMasterReleaseGate.ts`**: STEP 6 リリースゲート (ライフサイクル 5 段階遷移 & RELEASED 解放)
6. **`pipeline/NationalAddressDataPipeline.ts`**: 6 段階不可逆統制パイプライン
7. **`test_address_master_release_gate.ts`**: リリースゲート単体テストスイート (**100% PASS**)
