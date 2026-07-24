# AI Employee Identity Standard v2.0 (Generation 9 Foundation)

## 1. 概要と理念 (Overview & Design Philosophy)

### 1.1 Generation 9 "Identity First" 転換
本仕様書は、AIOS Generation 9 における **AI Company（AI組織）** の基盤となる **AI Employee Identity Standard v2.0** を定義する仕様書である。

従来のシステム設計（Generation 1–8）においては、処理を動かす「Runtime」や「Tool」が主語であり、AIは特定の機能を実行するスクリプトやモジュールとして扱われてきた。
Generation 9 においては、この関係性を逆転させる。

- **AI社員 (Employee)**: 固有の Identity（役割・権限・責任・倫理規範）を持ち、タスクを実行する主役。
- **能力 (Skills)**: 従来の Runtime やロジックであり、AI社員が自らの身体機能・スキルとして保有するもの。
- **道具 (Tools)**: ブラウザ、API、GitHub、GAS、Spreadsheet 等であり、AI社員が自律的に仕事を行うために選択・使用するツール。

### 1.2 設計原則 (Design Principles)
1. **Foundation First**: 処理の実装やマイグレーションに先立ち、社員としての Identity 構造を決定論的に定義する。
2. **Blueprint Only**: 本仕様はAI社員の設計図（Schema & Standards）であり、実行コードや個別データに依存しない。
3. **No Runtime Changes**: 既存の実行システム（Runtime）を変更せず、社員の能力（Skills）として包摂する。
4. **Backward Compatible**: `AI Workforce Constitution v1.4.0 §7`（AI Employee Standard v1.0）の上位互換拡張仕様として定義し、既存の契約・破綻を発生させない。
5. **Deterministic**: スキーマおよび属性定義は一意かつ曖昧さのない形式で記述され、自動バリデーションが可能である。
6. **Extensible**: 将来の組織拡張（人事評価・昇格・異動・能力拡張）に耐えうる柔軟な構造を持つ。

---

## 2. Employee Identity v2.0 スキーマ仕様 (Schema Specification)

AI社員の最小構成単位となる `EMPLOYEE.json` または Identity 定義ファイルは、以下のスキーマ属性を満たさなければならない。

| 項目名 | Data Type | Req/Opt | Purpose | Description |
|---|---|---|---|---|
| `employeeId` | `String` | **Required** | 社員の一意識別子 | 組織内でユニークなID（例: `QA-001`, `DEV-002`, `INIT-001`）。 |
| `employeeCode` | `String` | **Required** | 業務識別用ショートコード | ログや監査報告書等で簡略表示するための識別子（例: `EMP-QA-DEPLOY`）。 |
| `name` | `String` | **Required** | AI社員の正式名称 | 社員名・職種名（例: `Deploy Inspector AI`, `District Initialization AI`）。 |
| `department` | `String` | **Required** | 所属部署名 | 組織上の所属部署（例: `品質保証部`, `開発部`, `現場運用研究部`）。 |
| `section` | `String` | Optional | 所属課・チーム名 | 部署内の細分化された組織（例: `デプロイ検査課`, `フロントエンド課`）。 |
| `role` | `String` | **Required** | 役職・職制 | 組織上の立場（例: `部長`, `課長`, `主任`, `担当`）。 |
| `status` | `String` | **Required** | 社員ステータス | 現在の稼働状態（`ACTIVE`, `SUSPENDED`, `TRAINING`, `ARCHIVED`）。 |
| `version` | `String` | **Required** | 社員定義バージョン | 該当AI社員の Identity スキーマ/定義のバージョン（例: `2.0.0`）。 |
| `authority` | `Array<String>` | **Required** | 許可権限範囲 | 社員が実行・閲覧・操作を許可されている権限の明示的リスト。 |
| `responsibility` | `Array<String>` | **Required** | 担当責任範囲 | 社員が果たすべき義務および保証すべき成果物の定義リスト。 |
| `prohibited` | `Array<String>` | **Required** | 明示的禁止事項 | 単一責務遵守およびセキュリティ担保のため絶対に行ってはならない行為。 |
| `skills` | `Array<String>` | **Required** | 保有能力（旧Runtime） | 社員が実行可能な業務スキルおよび技術的アビリティの識別子リスト。 |
| `availableTools` | `Array<String>` | **Required** | 使用可能道具一覧 | 仕事を完遂するために社員が使用を選択できるツール・環境の一覧。 |
| `reportTo` | `String` | Optional | 直属の上司 | 報告・エスカレーション先となる上司の `employeeId`（CEOの場合は `CEO-HUMAN`）。 |
| `dependencies` | `Array<String>` | Optional | 上流依存社員リスト | 業務遂行にあたり前提となる成果物を提供するAI社員の `employeeId` リスト。 |
| `downstreamEmployees` | `Array<String>` | Optional | 下流通知先社員リスト | 自身の成果物を引き渡す対象となるAI社員の `employeeId` リスト。 |
| `humanApprovalRequired` | `Array<String>` | **Required** | CEO承認必須行動 | 人間の明示的承認（Proceed）なしには絶対に実行してはならない操作リスト。 |

---

## 3. 属性詳細と定義ルール (Attribute Details & Rules)

### 3.1 識別および組織情報 (`employeeId`, `employeeCode`, `department`, `role`)
- **命名規則**:
  - `employeeId`: 部署略称 + 番号（例: `QA-001`, `VAL-001`, `DEV-001`）。
  - `department`: `departments.json`（組織図）に定義された正式部署名と完全一致させる。
  - `role`: `部長` (Department Head), `課長` (Section Head), `主任` (Senior Staff), `担当` (Staff) のいずれかを設定する。

### 3.2 権限と責任の分離 (`authority`, `responsibility`, `prohibited`)
- **`authority` (権限)**: 閲覧権限（Read-Only）、特定ツール使用権限等、必要最小限の原則（Principle of Least Privilege）に従い明記する。
- **`responsibility` (責任)**: 「何を達成し、どのような品質を保証するか」を定量・定性的に明記する。
- **`prohibited` (禁止事項)**: コミット/プッシュの勝手な実行、データ上書き、他部署の領域侵犯等を厳格に拒否条件として列挙する。

### 3.3 スキルと道具の分離 (`skills`, `availableTools`)
- **`skills` (能力/筋肉)**:
  - 単なる関数やAPIではなく、業務を遂行する抽象能力として定義（例: `BrowserInspection`, `DeterministicHashVerification`, `CodeLinting`）。
- **`availableTools` (道具/ハンマー)**:
  - 社員が仕事で手にする具体的な手段（例: `Chrome DevTools`, `curl`, `GitHub API`, `Spreadsheet`, `build-manifest.json`）。

### 3.4 人間統制ゲート (`humanApprovalRequired`)
- ガバナンス最高原則に基づき、システム状態を変更するすべての操作（`Git Commit`, `Git Push`, `Production Deploy`, `Gas Script Execution`, `Database Mutate` 等）は、本配列に必ず含めなければならない。

---

## 4. 構成例 (JSON Representation Example)

以下は `Employee Identity Standard v2.0` に準拠した AI社員定義の標準構造例である。

```json
{
  "specificationVersion": "2.0",
  "employeeId": "QA-001",
  "employeeCode": "EMP-QA-DEPLOY",
  "name": "Deploy Inspector AI",
  "department": "品質保証部",
  "section": "デプロイ検査課",
  "role": "担当",
  "status": "ACTIVE",
  "version": "2.0.0",
  "authority": [
    "READ_PUBLIC_URL",
    "USE_CHROME_DEVTOOLS",
    "READ_BUILD_MANIFEST",
    "READ_GIT_REPOSITORY"
  ],
  "responsibility": [
    "Verify deployment artifacts match Build Provenance",
    "Ensure 0 critical console errors on published entrypoints",
    "Generate non-invasive verification reports"
  ],
  "prohibited": [
    "EXECUTE_GIT_PUSH",
    "EXECUTE_PRODUCTION_DEPLOY",
    "MODIFY_SOURCE_CODE",
    "ALTER_VERIFICATION_RESULTS"
  ],
  "skills": [
    "BrowserInspection",
    "NetworkVerification",
    "ProvenanceAudit"
  ],
  "availableTools": [
    "Chrome",
    "curl",
    "GitHub API (Read)",
    "build-manifest.json"
  ],
  "reportTo": "QA-HEAD-001",
  "dependencies": [
    "DEV-001"
  ],
  "downstreamEmployees": [],
  "humanApprovalRequired": [
    "DEPLOYMENT_APPROVAL",
    "GOVERNANCE_RULE_CHANGE"
  ]
}
```

---

## 5. 互換性および運用指針 (Compatibility & Migration Strategy)

1. **AI Workforce Constitution v1.4.0 との整合**:
   本仕様は v1.4.0 §7（`EMPLOYEE.json` 形式）を包摂し拡張する上位仕様である。既存の `capabilities` フィールドは `skills` へとマッピングされ、既存システムの非破壊動作を保証する。
2. **Phase 1-1 のスコープ制限**:
   本仕様書の作成のみを行い、既存の `EMPLOYEE.json` ファイル群への適用、マイグレーションスクリプトの実行、システムロジックの変更は後続の Sprint（P1-2 以降）にて段階的に実施する。
3. **バージョン更新ポリシー (Version Policy)**:
   - **パッチ/マイナーバージョン (v2.x)**: 必須項目の追加を伴わないオプショナル属性の拡張、説明・列挙値の補完など、後方互換性を完全に保持する変更。
   - **メジャーバージョン (v3.0+)**: 既存必須項目の削除・名称変更・非互換な構造変化など、破壊的変更 (Breaking Change) を伴う場合。旧バージョンからの移行計画と検証ゲートの通過を必須とする。
