# AI Workforce Constitution v1.3.0
System: POSTING MAP / FIELD OPERATIONS OS
Author: 岩佐CEO
Status: STABLE RELEASE (Version 1.3.0)

---

## ■ Fundamental Principles (不変の思想)

### 1. Single Source of Truth (SSOT)
- `master/` フォルダは唯一無二の正本領域であり、AI社員間のすべての知識・データの集約拠点とする。

### 2. No Output Chaining Principle (成果物連鎖禁止原則)
- Production AI は、他の Production AI の `output/` を入力にしてはならない。
- AI社員同士のデータバトンリレー・連携は、常に劣化のない `master/`（AI正本領域）のみを介して行う。

### 3. Immutable Output Principle (不変成果物原則)
- 一度 Acceptance Gate を通過した成果物は直接上書き修正・変更してはならない。
- 変更・修正が必要な場合は `master/` のバージョンをインクリメントし、新しい `output/`（新バージョン）を再生成する。

### 4. Data Ownership Principle (データ所有権原則)
- **Rule 1**: 各 Production AI は、自らが所有する `master/` 配下のファイルに対してのみ書き込み（Write）を行う。
- **Rule 2**: 他AI社員が所有する `master/` 正本は、すべてのAI社員が自由かつ安全に参照（Read: OK / Write: NG）できる。
- **Rule 3**: `output/` は人間・外部システム向けの端末成果物であり、AI同士は参照しない。
- **Rule 4**: `source/` は一次素材領域であり、担当AIが `master/` 正本まで昇華させる。
- **Rule 5**: 他AIの `master/` データを変更したい場合は、その Owner AI へ更新リクエストを委任・発行する。

---

## ■ Standards (7大標準)

### 1. Business Workspace Standard v1.0
- **標準8大構造**: `01_MASTER`, `02_SYSTEM`, `03_BRANCH`, `04_STORAGE`, `05_BACKUP`, `06_DASHBOARD`, `07_MANUAL`, `99_ARCHIVE`.
- **03_BRANCH 構造**: `03_BRANCH/【都道府県】/【選挙区】/` 配下に `source/`, `master/`, `output/`, `logs/` を配置。

### 2. Data Ownership Standard v1.0
- 各 Production AI が所有する正本ファイルとアクセス権限（Read-Only Shared / Single Owner Write）を固定。

### 3. Acceptance Standard v1.0
- **Acceptance Gate (AG-001 ~ AG-005)**:
  - `AG-001`: Workspace Verification (`WS_`)
  - `AG-002`: Artifact Verification (`ART_`)
  - `AG-003`: Content Verification (`CNT_`)
  - `AG-004`: Evidence Verification (`EVD_`)
  - `AG-005`: Deterministic Verification (`DET_`)
- **Acceptance Report**: Validation AI が非侵襲検査（Zero-Mutation）により全 Gate の合否および構造化エラーコード・SHA-256署名を記録した不可変レポート。

### 4. Data Contract Standard v1.0
- 所有者以外のAI社員がデータを更新したい場合、標準化された `Update Request` 契約を Owner AI へ送信する。
- Owner AI のみが「検証 ──► master更新 ──► version更新 ──► 完了通知」を実行する。

### 5. Data Lineage Standard v1.1
- 複数入力（Multi-Input DAG）に対応した `inputs` 配列構造。全工程のデータ由来・依存バージョン・チェックサム・生成時刻を100%完全追跡。

### 6. Artifact Standard v1.0
- すべての `master/*.json` 正本が共通で保持すべきヘッダー構造（`schemaVersion`, `artifactId`, `owner`, `lineage`, `lastUpdated`）の完全統一仕様。

### 7. AI Employee Standard v1.0 (AI社員契約標準 - NEW)
- すべての AI社員（PRODUCTION / VALIDATION / GOVERNANCE）が共通して従う機械判読可能な社員マニフェスト（`EMPLOYEE.json`）。
- **共通社員メタデータ構造**:
  - `employeeId`: 社員識別ID (例: `AI-0001`, `AI-0002`, `AI-VAL-0001`)
  - `employeeName`: 正式AI社員名
  - `employeeType`: `PRODUCTION` | `VALIDATION` | `GOVERNANCE`
  - `version`: Semantic Versioning (`v2.3.0`)
  - `status`: `ACTIVE` | `SUSPENDED` | `DEPRECATED` | `RETIRED`
  - `responsibility`: 業務責務配列
  - `capabilities`: 提供可能能力配列
  - `acceptedInputs`: 受入可能入力配列
  - `ownedArtifacts`: 書き込み所有権保持成果物配列
  - `producedArtifacts`: 生成可能成果物配列
  - `validator`: 受入検査担当 Validation AI 名
  - `dependencies`: 上流依存 AI社員 ID 配列 (`["AI-0001"]`)
  - `downstreamEmployees`: 成果物を消費する下流 AI社員 ID 配列 (`["AI-0003"]`)
