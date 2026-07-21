# Workflow: Acceptance Validator AI

## 検査シーケンス (Acceptance Gate Standard)
```text
  [入力: Production AI 成果物パス]
        │
        ▼
  Gate 1 (AG-001): Workspace Verification
        │   └─ 保存先・4標準フォルダ（source, master, output, logs）存在確認
        ▼
  Gate 2 (AG-002): Artifact Verification
        │   └─ 必要ファイル（CSV, JSON）の物理存在確認
        ▼
  Gate 3 (AG-003): Content Verification
        │   └─ 1自治体1行、データ形式、件数一致、公的データ整合確認
        ▼
  Gate 4 (AG-004): Evidence Verification
        │   └─ sources, URL, retrievedAt, verified 証跡の確認
        ▼
  Gate 5 (AG-005): Deterministic Verification
        │   └─ SHA-256 ハッシュ照合・再現性検証
        │
        ├─【全Gate合格】 ──► overallStatus: "SUCCESS"
        │
        └─【1つでも不合格】──► overallStatus: "FAILED" ＋ 構造化 failures エラーコード発行
              │
              ▼
  `logs/acceptance_report.json` を非侵襲書き込み（Acceptance Report Standard v1.0）
```

---

## 5大検査ゲート仕様 (Acceptance Gate Standard)

### AG-001: Workspace Verification
- **目的**: `Business Workspace Standard v1.0` に準拠したディレクトリ構造であるかを検証。
- **FAILコード**: `WORKSPACE_STRUCTURE_INVALID`, `WORKSPACE_FOLDER_MISSING`

### AG-002: Artifact Verification
- **目的**: 必要な成果物ファイルが揃っているかを検証。
- **FAILコード**: `ARTIFACT_FILE_MISSING`, `REQUIRED_LOG_MISSING`

### AG-003: Content Verification
- **目的**: CSVおよびJSONの内部コンテンツの整合性を検証。
- **FAILコード**: `CSV_FORMAT_INVALID`, `MUNICIPALITY_COUNT_MISMATCH`, `PREFECTURE_MISMATCH`

### AG-004: Evidence Verification
- **目的**: 照合ソース、参照URL、取得時刻が完全かを検証。
- **FAILコード**: `EVIDENCE_SOURCE_MISSING`, `EVIDENCE_URL_INVALID`, `EVIDENCE_TIMESTAMP_INVALID`

### AG-005: Deterministic Verification
- **目的**: SHA-256 ハッシュによる非改ざん性と再現性を検証。
- **FAILコード**: `HASH_MISMATCH`, `ARTIFACT_CORRUPTED`
