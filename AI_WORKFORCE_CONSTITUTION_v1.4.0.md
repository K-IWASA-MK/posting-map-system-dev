# AI Workforce Constitution v1.4.0
System: POSTING MAP / FIELD OPERATIONS OS
Author: 岩佐CEO
Status: STABLE RELEASE (Version 1.4.0)

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

### 5. Human-to-AI Workforce Education Principle (AI社員教育思想)
- **「人間が初めて行う作業 = AI社員の教育機会」**
- AIOS は単なる開発・実行環境ではなく、人間が試行錯誤して得た経験・知識を AI社員の組織知として蓄積し、全自動化するためのプラットフォームである。

### 6. Experience-First Learning Principle (経験先行学習原則 - NEW)
- **「AI社員は『設計書から学ぶ』のではなく、『成功した経験から学ぶ』。」**
- 予想SOP・設計SOP・仮説SOP で AI社員を教育することを厳禁とし、実際に作業を完遂・実証・承認された「実証済み経験」のみを教育資産として SOP 化する。

---

## ■ Standards (9大標準)

### 1. Business Workspace Standard v1.0
- **標準8大構造**: `01_MASTER`, `02_SYSTEM`, `03_BRANCH`, `04_STORAGE`, `05_BACKUP`, `06_DASHBOARD`, `07_MANUAL`, `99_ARCHIVE`.

### 2. Data Ownership Standard v1.0
- 各 Production AI が所有する正本ファイルとアクセス権限（Read-Only Shared / Single Owner Write）を固定。

### 3. Acceptance Standard v1.0
- **Acceptance Gate (AG-001 ~ AG-005)**: 非侵襲検査 5-Gate 判定および不可変レポート生成。

### 4. Data Contract Standard v1.0
- 所有者以外のAI社員がデータを更新したい場合、標準化された `Update Request` 契約を Owner AI へ送信する。

### 5. Data Lineage Standard v1.1
- 複数入力（Multi-Input DAG）に対応した `inputs` 配列構造。全工程のデータ由来・依存バージョン・チェックサム・生成時刻を100%完全追跡。

### 6. Artifact Standard v1.0
- すべての `master/*.json` 正本が共通で保持すべきヘッダー構造（`schemaVersion`, `artifactId`, `owner`, `lineage`, `lastUpdated`）の完全統一仕様。

### 7. AI Employee Standard v1.0
- すべての AI社員が共通して従う機械判読可能な社員マニフェスト（`EMPLOYEE.json`）。

### 8. Rendering Contract Standard v1.0
- すべての表示系 AI社員（Spreadsheet AI, PDF AI, Dashboard AI 等）に適用される共通原則。
- **Pure Renderer Constraint**: 表示系 AI はデータの再計算・再カウント・独自ロジック補正を一切行わない。
- **Rendering Contract Decoupling**: 表示系 AI は「何を表示するか（セル/画面配置マッピング）」を自ら決定せず、独立した `RENDERING_CONTRACT.json` に従って機械的に配置・描画出力する。

### 9. AI Workforce Education & Governance Standard v1.0
- **Rule-AI-001 (SOP化ルール)**: 人間が新しい運用手順を確立した場合、その手順は必ず AI社員の SOP (`07_MANUAL/` & `/AI社員/[Agent]/`) として教育する。
- **Rule-AI-002 (AI社員への完全移管)**: 同じ作業を二度、人間が行わない。一度確立・検証された作業は次回からすべて AI社員へ自律移管する。
- **Rule-AI-003 (SOPはプラットフォーム共有資産)**: SOP は AI社員の知識バトン・公式マニフェスト・ガバナンスの共通資産として一元管理・永続保存する。
- **Rule-AI-004 (実証済み経験限定原則 - NEW)**: SOP は実際の対象（例: 三重第3区）が完成・実証されてから作成する。予想・設計・仮説段階での SOP 作成および AI教育を禁止する。
