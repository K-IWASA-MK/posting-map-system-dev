# Runtime Resolution Gate Standard Specification

**Standard Identifier**: `AIOS-STD-RV-006`  
**Title**: Runtime Resolution Gate Standard (GRAND FINALE)  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: Runtime Verification Foundation  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と理念 (Purpose & Philosophy)

本仕様書は、Runtime Verification Foundation (RV-1 ~ RV-5) において収集・統合された `RuntimeEvidencePackage` を検証し、コード変更が実際に対象障害を解消し期待通り動いているかを客観的に判定する最高完了統裁ゲート **`Runtime Resolution Gate`** の基準を定める。

### 憲法基本原則 (第 15 大基本原則)
> **`Runtime Resolution Principle`**  
> AI社員は、コードの実装完了をもって成果とみなしてはならない。修正対象が Runtime 上で期待通り動作し、その解決が RuntimeEvidencePackage によって証明された場合にのみ、Completion Report を提出できる。

---

## 2. アーキテクチャ位置付け (Architectural Placement)

Generation 9 の組織統制モデルに従い、本標準は **AIOS Runtime の最高完了統裁ゲート** として機能し、本ゲートの通過 (`PASS`) なしにレビュー要請および Completion Report の提出を行うことを絶対禁止する。

```
[Developer AI] ──(実装)──> [AIOS Runtime] ──(実効)──> [RuntimeEvidencePackage (RV-5)]
                                                               │
                                                               ▼
                                                  [Runtime Resolution Gate (RV-6)]
                                                   ├── 1. evidenceCompleteness.allPresent == true
                                                   ├── 2. resolutionVerification.resolved == true
                                                   ├── 3. completionEligibility == "READY_FOR_REVIEW"
                                                   └── 4. verificationSummary.aggregateStatus == "PASS"
                                                               │
                                           ┌───────────────────┴───────────────────┐
                                           ▼ (PASS)                                ▼ (FAIL)
                                    [Completion Report]                     [NOT COMPLETE]
                                    (Reviewer / Audit 送付)               (提出禁止・修正強制)
```

---

## 3. Core Gate Decision Schema (RuntimeResolutionGateResult)

すべての Runtime Resolution Gate の結果は、以下の構造化レコードとして不変保存されなければならない。

| 属性名 (Attribute) | 型 (Type) | 必須 | 説明 (Description) |
|---|---|---|---|
| `verifiedExecutionId` | `String` (UUID v4) | 必須 | 検証対象の `executionId`。 |
| `gateDecision` | `String` (Enum) | 必須 | ゲート最終判定結果 (`PASS`, `FAIL`)。 |
| `gateFailureReasons` | `Array` (String) | 必須 | 不合格時の具体的な却下理由リスト（合格時は空配列）。 |
| `evaluatedAt` | `String` (ISO 8601) | 必須 | ゲート判定が実行された日時 (UTC)。 |
| `evaluatedBy` | `String` | 必須 | 判定を実施したコンポーネント (例: `"AIOS-Runtime-Resolution-Gate-v1.0"`)。 |
| `manualOverride` | `Object` | 必須 | 人間経営者（CEO）による特例適用拡張情報。 |
| `gateResultHash` | `String` (SHA-256) | 必須 | 本 Gate レコード全体の SHA-256 不変ハッシュ。 |

---

## 4. 厳格判定ルール & Blocking Rule (Enforcement Protocol)

### A. Gate 通過条件 (PASS Condition)
以下の 4 条件が**全て同時に満たされた場合のみ** `gateDecision` は `PASS` となる。

1. **`evidenceCompleteness.allPresent == true`**: RV-1 (Browser), RV-2 (DevTools), RV-3 (HTTP), RV-4 (UI) が全揃いしていること。
2. **`resolutionVerification.resolved == true`** かつ **`verifiedByRuntime == true`**: 対象障害が Runtime 上で解決されたこと。
3. **`completionEligibility == "READY_FOR_REVIEW"`**: レビュー提出資格を満たしていること。
4. **`verificationSummary.aggregateStatus == "PASS"`**: エラー数が 0 件かつ総括判定が合格であること。

### B. 提出遮断ルール (Blocking Rules)
`gateDecision` が `FAIL` の場合、以下の操作が自動的に絶対遮断（`NOT COMPLETE`）される。

- ❌ `Completion Report` (完了報告書) の提出および人間・Reviewer AI への通知
- ❌ タスク状態の `COMPLETED` または `RESOLVED` への変更
- ❌ Git リリース / タグの作成および本番デプロイ操作
- ❌ 成果物受け渡し (Task Handoff) の実行

---

## 5. Manual Override 規定 (Human Management Extension)

例外的なインフラ障害や外部サービス停止等の場合、人間経営者（岩佐CEO）の明示的承認に基づき、`manualOverride` を適用できる。

```json
"manualOverride": {
  "overridden": false,
  "reason": null,
  "authorizedBy": null,
  "overrideTimestamp": null
}
```

- **原則**: 人間権限のみが `overridden: true` を書き込める。AI が自律的にオーバーライドを行うことは憲法上固く禁止される。

---

## 6. JSON Schema 定義 (RuntimeResolutionGateResult Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RuntimeResolutionGateResult",
  "type": "object",
  "required": [
    "verifiedExecutionId",
    "gateDecision",
    "gateFailureReasons",
    "evaluatedAt",
    "evaluatedBy",
    "manualOverride",
    "gateResultHash"
  ],
  "properties": {
    "verifiedExecutionId": { "type": "string", "format": "uuid" },
    "gateDecision": { "type": "string", "enum": ["PASS", "FAIL"] },
    "gateFailureReasons": {
      "type": "array",
      "items": { "type": "string" }
    },
    "evaluatedAt": { "type": "string", "format": "date-time" },
    "evaluatedBy": { "type": "string", "example": "AIOS-Runtime-Resolution-Gate-v1.0" },
    "manualOverride": {
      "type": "object",
      "required": ["overridden"],
      "properties": {
        "overridden": { "type": "boolean" },
        "reason": { "type": ["string", "null"] },
        "authorizedBy": { "type": ["string", "null"] },
        "overrideTimestamp": { "type": ["string", "null"] }
      }
    },
    "gateResultHash": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" }
  },
  "additionalProperties": false
}
```

---

## 7. Compliance Verification (適合性アサーション)

本仕様に適合していることを検証するため、アサーションプログラムは以下を確認しなければならない。

1. コア属性が全て存在し、`gateDecision` が `PASS` または `FAIL` であること。
2. 不合格時に `gateFailureReasons` へ具体的な理由が記録されること。
3. `gateResultHash` が正則な SHA-256 ハッシュ文字列であること。
