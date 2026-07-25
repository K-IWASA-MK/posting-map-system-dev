# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 8.0 (全国289選挙区展開用・Boundary Master Foundation 統合版)  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS / BOUNDARY MASTER FOUNDATION ENGINE  

---

## ■ 最重要原則: 住所基盤 と 選挙区基盤 の厳格な分離 (Responsibility Separation)
```
┌─────────────────────────────────────────────────────────────┐
│ 住所基盤 (ADDRESS_MASTER)  ➔ 役割:「全国の住所を正しく理解する」│
│ 選挙区基盤 (Boundary Master) ➔ 役割:「どの住所がどの選挙区か判断する」│
│                                                             │
│ 【STEP 6: Release Gate】で RELEASED 承認された ADDRESS_MASTER│
│ に対してのみ、【STEP 7: Boundary Master Foundation】が       │
│ 小選挙区区割りデータ (Pattern A 全域包含 / Pattern B 分割自治体)│
│ を重ね合わせる。                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ■ 正式な 7 段階 不可逆プラットフォーム フロー

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
[STEP 5] 全国 ADDRESS_MASTER 品質検証層 (Address Master Accuracy Verification Engine)
         ├─ 欠損0件証明 (`missingLevel1Count === 0`)
         ├─ 複合キー重複確認 & 同一住所複数郵便番号ノート記録
         └─ 安全な表記揺れ統一 (全角「１丁目」・漢数字「一丁目」➔ 「1丁目」/ 「一番町」誤変換防止)
            │
            ▼
[STEP 6] Address Master Release Gate (状態遷移: GENERATED ➔ RELEASED)
         └─ master/address_master_release_manifest.json (RELEASED 証明)
            │
            ▼ (ステータスが RELEASED の場合のみ Boundary Resolver 解放)
[STEP 7] Boundary Master Foundation ★新規構築
         ├─ 入力: RELEASED ADDRESS_MASTER ＋ 行政区割りデータ
         ├─ 分類判定: Pattern A (全域包含) vs Pattern B (分割自治体包含/除外キーワード照合)
         └─ 成果物: boundary/BOUNDARY_MASTER_{districtId}.csv & boundary_master_{districtId}_manifest.json
            │
            ▼
[STEP 8] 対象地域確定 ➔ POSTING MAP 確定 SSOT CSV ➔ スプレッドシート表示レイヤー化
```

---

## ■ モジュール構造 (`src/platform/address-data-platform/`)

1. **`raw/RawDataIngestor.ts`**: KEN_ALL.CSV & 行政マスター取得・`raw_audit_manifest.json` SHA-256 監査
2. **`parser/NationalAddressHierarchyParser.ts`**: 安全な表記揺れ対応 Rule v3 解析器
3. **`generator/AddressMasterGenerator.ts`**: `ADDRESS_MASTER.csv` & `address_master_evidence.json` 出力
4. **`verifier/AddressMasterVerifier.ts`**: STEP 5 精度検証エンジン
5. **`gate/AddressMasterReleaseGate.ts`**: STEP 6 リリースゲート (`RELEASED` 承認)
6. **`boundary/BoundaryMasterFoundation.ts`**: STEP 7 選挙区境界統合エンジン
7. **`pipeline/NationalAddressDataPipeline.ts`**: 7 段階統制パイプライン
8. **`test_boundary_master_foundation.ts`**: STEP 7 テストスイート (**100% PASS**)
