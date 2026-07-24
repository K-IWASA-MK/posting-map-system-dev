# Runtime Evidence Standard Specification

**Standard Identifier**: `AIOS-STD-RV-005`  
**Title**: Runtime Evidence Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: Runtime Verification Foundation  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と理念 (Purpose & Philosophy)

本仕様書は、RV-1 (Browser), RV-2 (DevTools), RV-3 (HTTP), RV-4 (UI) で生成された個別の実行証跡を、単一の実行単位 (`executionId`) に基づき集約・統合する不変証跡パッケージ **`RuntimeEvidencePackage`** の標準構造および記録基準を定める。

単にログを束ねるだけでなく、**「修正対象の障害（Target Issue）が動的に解決されたか（Resolution Verification）」** および **「成果物提出資格を満たしているか（Completion Eligibility）」** を構造化明記することを目的とする。

### 憲法基本原則
> **`Unified Runtime Evidence Principle`**  
> 個別の動的実行証跡はバラバラに評価されてはならず、共通の `executionId` と暗号化パッケージハッシュに束ねられた単一の不変パッケージ（RuntimeEvidencePackage）として統合記録されなければならない。障害解決の動的証明（Resolution Verification）なしにパッケージは完成しない。

---

## 2. アーキテクチャ位置付け (Architectural Placement)

Generation 9 の組織統制モデルに従い、本標準は **AIOS Runtime の「多層動的証跡集約・パッケージング能力」** として位置付けられ、Reviewer AI および RV-6 Gate の唯一の入力情報（Input SSOT）として機能する。

```
Execution Session (executionId)
       │
       ├── RV-1: BrowserVerificationRecord
       ├── RV-2: DeveloperToolsRecord
       ├── RV-3: HttpVerificationRecord
       └── RV-4: UiVerificationRecord
               │
               ▼
   [RuntimeEvidencePackage (RV-5)]
   ├── executionMetadata
   ├── resolutionVerification (Target Issue Resolution)
   ├── evidenceCompleteness (allPresent: true/false)
   ├── verificationSummary (aggregateStatus)
   ├── completionEligibility (READY_FOR_REVIEW / NOT_READY)
   └── integrityMetadata (evidencePackageHash)
               │
               ▼
   [RV-6: Runtime Resolution Gate]
```

---

## 3. Core Runtime Evidence Package Schema (コア属性)

`RuntimeEvidencePackage` は以下の主要セクションおよび属性を保持しなければならない。

| セクション / 属性名 | 型 (Type) | 必須 | 説明 (Description) |
|---|---|---|---|
| `packageId` | `String` (UUID v4) | 必須 | パッケージ一意識別キー。 |
| `executionId` | `String` (UUID v4) | 必須 | 全スプリント横断実行 ID。 |
| `schemaVersion` | `String` | 必須 | 仕様バージョン (例: `"1.0"`)。 |
| `capturedTimestamp` | `String` (ISO 8601) | 必須 | パッケージ確定タイムスタンプ (UTC)。 |
| `browserEvidence` | `Object` / `String` | 必須 | RV-1 レコードまたは URI/SHA-256 参照。 |
| `devToolsEvidence` | `Object` / `String` | 必須 | RV-2 レコードまたは URI/SHA-256 参照。 |
| `httpEvidence` | `Object` / `String` | 必須 | RV-3 レコードまたは URI/SHA-256 参照。 |
| `uiEvidence` | `Object` / `String` | 必須 | RV-4 レコードまたは URI/SHA-256 参照。 |
| `evidenceCompleteness` | `Object` | 必須 | 各 Evidence の揃い踏み状態 (`browser`, `devTools`, `http`, `ui`, `allPresent`)。 |
| `resolutionVerification` | `Object` | 必須 | 修正対象問題の解決証明 (`targetIssue`, `expectedOutcome`, `actualOutcome`, `resolved`, `verifiedByRuntime`)。 |
| `verificationSummary` | `Object` | 必須 | 総合結果要約 (`aggregateStatus`: `PASS`/`FAIL`/`PARTIAL`, `totalErrorCount`)。 |
| `completionEligibility` | `String` (Enum) | 必須 | レビュー提出資格 (`READY_FOR_REVIEW`, `NOT_READY`)。 |
| `integrityMetadata` | `Object` | 必須 | パッケージ不変ハッシュ情報 (`evidencePackageHash`)。 |

---

## 4. 詳細領域の仕様分類 (Detailed Specifications)

### A. Resolution Verification モデル (問題解決動的証明)
「コードを変更した」ことではなく「対象問題がコード通り解消したこと」を証明するコア構造。

```json
"resolutionVerification": {
  "targetIssue": "PM-AUT-001",
  "expectedOutcome": "Authentication succeeds and getAppData returns HTTP 200 with areas payload",
  "actualOutcome": "Authentication succeeds and getAppData returns HTTP 200 with areas payload",
  "resolved": true,
  "verifiedByRuntime": true
}
```

### B. Evidence Completeness (証跡全揃いアサーション)
4 大証跡の一部でも欠損している場合、`allPresent` は `false` となり、パッケージ全体の提出資格が剥奪される。

```json
"evidenceCompleteness": {
  "browser": true,
  "devTools": true,
  "http": true,
  "ui": true,
  "allPresent": true
}
```

### C. Completion Eligibility 判定原則
- **`READY_FOR_REVIEW`**: `allPresent` が `true`、`aggregateStatus` が `PASS`、かつ `resolutionVerification.resolved` が `true` の場合のみ付与。
- **`NOT_READY`**: いずれかの条件を満たさない場合（証跡不足、エラー残留、問題未解決）。

---

## 5. JSON Schema 定義 (RuntimeEvidencePackage Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RuntimeEvidencePackage",
  "type": "object",
  "required": [
    "packageId",
    "executionId",
    "schemaVersion",
    "capturedTimestamp",
    "browserEvidence",
    "devToolsEvidence",
    "httpEvidence",
    "uiEvidence",
    "evidenceCompleteness",
    "resolutionVerification",
    "verificationSummary",
    "completionEligibility",
    "integrityMetadata"
  ],
  "properties": {
    "packageId": { "type": "string", "format": "uuid" },
    "executionId": { "type": "string", "format": "uuid" },
    "schemaVersion": { "type": "string", "example": "1.0" },
    "capturedTimestamp": { "type": "string", "format": "date-time" },
    "browserEvidence": { "type": ["object", "string"] },
    "devToolsEvidence": { "type": ["object", "string"] },
    "httpEvidence": { "type": ["object", "string"] },
    "uiEvidence": { "type": ["object", "string"] },
    "evidenceCompleteness": {
      "type": "object",
      "required": ["browser", "devTools", "http", "ui", "allPresent"],
      "properties": {
        "browser": { "type": "boolean" },
        "devTools": { "type": "boolean" },
        "http": { "type": "boolean" },
        "ui": { "type": "boolean" },
        "allPresent": { "type": "boolean" }
      }
    },
    "resolutionVerification": {
      "type": "object",
      "required": ["targetIssue", "expectedOutcome", "actualOutcome", "resolved", "verifiedByRuntime"],
      "properties": {
        "targetIssue": { "type": "string", "example": "PM-AUT-001" },
        "expectedOutcome": { "type": "string" },
        "actualOutcome": { "type": "string" },
        "resolved": { "type": "boolean" },
        "verifiedByRuntime": { "type": "boolean" }
      }
    },
    "verificationSummary": {
      "type": "object",
      "required": ["aggregateStatus", "totalErrorCount"],
      "properties": {
        "aggregateStatus": { "type": "string", "enum": ["PASS", "FAIL", "PARTIAL"] },
        "totalErrorCount": { "type": "integer", "minimum": 0 }
      }
    },
    "completionEligibility": { "type": "string", "enum": ["READY_FOR_REVIEW", "NOT_READY"] },
    "integrityMetadata": {
      "type": "object",
      "required": ["evidencePackageHash"],
      "properties": {
        "evidencePackageHash": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" }
      }
    }
  },
  "additionalProperties": false
}
```

---

## 6. Compliance Verification (適合性アサーション)

本仕様に適合していることを検証するため、アサーションプログラムは以下を確認しなければならない。

1. コア属性および `resolutionVerification` セクションが存在すること。
2. `evidenceCompleteness.allPresent` が `true` でない場合、`completionEligibility` が `NOT_READY` となること。
3. `integrityMetadata.evidencePackageHash` が正則な SHA-256 ハッシュ文字列であること。
