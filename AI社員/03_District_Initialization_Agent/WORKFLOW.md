# Workflow: District Initialization AI

## ■ SOP v1: 支部作成自律実行フロー (Master Governance 準拠)

本 Agent はユーザーから「〇〇支部を作成して」（例: `NARA-07支部を作成して`）と指示を受けた際、以下の SOP v1 手順で自律的にプロビジョニングを実行する。

```text
  [ユーザー指示: 例 NARA-07 支部を作成して]
        │
        ▼
  STEP 1: 原本コピー (POSTING MAP MASTER)
        │
        ▼
  STEP 2: スプレッドシート名変更
        │   ファイル名 (画面左上): {branchId} v{masterVersionMajor} (例: NARA-07 v1)
        │
        ▼
  STEP 3: 内部シート（タブ）の保護
        │   原本構造を 100% 完全保持 (タブ名は一切変更しない)
        │
        ▼
  STEP 4: 表示名設定
        │   displayName: 奈良第7支部
        │
        ▼
  STEP 5: deployment.json マニフェスト生成
        │   branchId, masterVersion, createdFrom, spreadsheetId, spreadsheetTitle 等の不変記録
        │
        ▼
  STEP 6: Google Drive (1FfcVEQjod--rZSucOPFJD2DJ58hV650_) へ完全同期保存
        │   03_BRANCH/NARA-07/ 内へ実体配置
        │
        ▼
  STEP 7: 地区データ投入待ち状態 (BRANCH_CREATED_READY_FOR_DATA) へ遷移し完了報告
```

---

## 監査・検証ゲート (Governance Rule-001 〜 Rule-005)
- **Rule-001**: 必ず最新の MASTER から作成
- **Rule-002**: 承認済みの原本のみ使用
- **Rule-003**: 世代 (`masterVersion`) と系譜 (`createdFrom`) のリネージ記録
- **Rule-004**: ファイル名 `{branchId} v{masterVersionMajor}`、内部シート名は原本保持
- **Rule-005**: 既存支部ファイルは永久上書き不可 (Immutability)
