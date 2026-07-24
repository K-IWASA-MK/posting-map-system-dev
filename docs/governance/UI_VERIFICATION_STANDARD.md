# UI Verification Standard Specification

**Standard Identifier**: `AIOS-STD-RV-004`  
**Title**: UI Verification Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: Runtime Verification Foundation  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と理念 (Purpose & Philosophy)

本仕様書は、AIOS Runtime が Web アプリケーション画面（UI）の実際のリファクタリング・修正・描画結果を、画像ファイルだけに留まらず、機械検証可能な構造化データ（UI Verification Evidence）として標準記録するための基準を定める。

単なる視覚スクリーンショットにとどまらず、**「期待される UI 状態（Expected）と実際の UI 状態（Actual）の対比」** および **「問題が本当に解決したかのアサーション」** を構造化証跡として抽出することを目的とする。

### 憲法基本原則
> **`Visual State Is Structural Evidence Principle`**  
> UI の実行状態は人間向けの視覚画像にとどまらず、期待値と実測値の差分（Diff）を非曖昧に比較・検証できる構造化データとして証明されなければならない。

---

## 2. アーキテクチャ位置付け (Architectural Placement)

Generation 9 の組織統制モデルに従い、本標準は **AIOS Runtime の「UI 状態構造化自動検証能力」** として位置付けられ、`executionId` および `browserSessionId` を用いて、RV-1（Browser）、RV-2（DevTools）、RV-3（HTTP）の各証跡と完全バインドされる。

```
Execution Session (executionId / browserSessionId)
       │
       ├── RV-1: BrowserVerificationRecord (URL, Status, Screenshot)
       ├── RV-2: DeveloperToolsRecord (Console, HAR, Storage, Exceptions)
       ├── RV-3: HttpVerificationRecord (Request, Response, Auth Evidence)
       └── RV-4: UiVerificationRecord (Expected vs Actual, HUD, DOM Hash, UI Assertion)
```

---

## 3. Core UI Evidence Schema (コア属性)

すべての UI Verification Evidence レコードは、以下の属性を保持しなければならない。

| 属性名 (Attribute) | 型 (Type) | 必須 | 説明 (Description) |
|---|---|---|---|
| `executionId` | `String` (UUID v4) | 必須 | 全スプリント共通実行 ID。 |
| `browserSessionId` | `String` (UUID v4) | 必須 | 親 Browser Session ID。 |
| `schemaVersion` | `String` | 必須 | 本仕様のバージョン (例: `"1.0"`)。 |
| `capturedTimestamp` | `String` (ISO 8601) | 必須 | UI キャプチャタイムスタンプ (UTC)。 |
| `uiAssertionResult` | `String` (Enum) | 必須 | UI 全体のアサーション判定 (`PASS`, `FAIL`, `PARTIAL`)。 |
| `expectedHudState` | `Object` | 必須 | 期待される HUD ステータスマップ (キー・バリュー)。 |
| `actualHudState` | `Object` | 必須 | 実際に取得された HUD ステータスマップ。 |
| `elementPresenceMap` | `Object` | 必須 | 画面必須 DOM 要素の表示判定 (`present: true/false`)。 |
| `buttonInteractiveStates` | `Object` | 必須 | ボタン対話対状態 (`ENABLED`, `DISABLED`, `HIDDEN`)。 |
| `errorElementList` | `Array` (Object) | 必須 | 露出したエラーメッセージ要素の検出一覧。 |
| `loadingState` | `String` (Enum) | 必須 | ローディング表示の状態 (`IDLE`, `LOADING`, `COMPLETED`)。 |
| `uiScreenshotRef` | `String` (URI/Hash) | 必須 | 画像証跡の不変参照 (`URI + SHA-256`)。 |
| `domSnapshotHash` | `String` (SHA-256) | 必須 | DOM 構造全体の SHA-256 不変ハッシュ。 |
| `domVersion` | `String` | 必須 | DOM レイアウト定義のバージョン (例: `"v2.1"`)。 |
| `evidenceHash` | `String` (SHA-256) | 必須 | 本 JSON レコード全体の SHA-256 不変ハッシュ。 |

---

## 4. 詳細領域の仕様分類 (Detailed Specifications)

### A. Expected vs Actual HUD 対比モデル (Reviewer Automated Assessment)
HUD（Heads-Up Display）等の画面状態は、期待値と実測値のオブジェクト差分により直ちに `uiAssertionResult` を自動算定できる構造とする。

```json
{
  "expectedHudState": {
    "liffInit": "OK",
    "getAppData": "OK"
  },
  "actualHudState": {
    "liffInit": "OK",
    "getAppData": "OK (areas: 12)"
  }
}
```

### B. UI Assertion Result 判定分類
- **`PASS`**: 必須要素がすべて存在し、エラー要素が 0 件、期待される HUD / UI 状態と完全に一致。
- **`FAIL`**: エラー表示の露出、非活性の必須ボタン、または `PM-AUT-001` 等のエラー状態が存在。
- **`PARTIAL`**: 非重要領域（警告メッセージ等）の軽微な差分が存在するが、基本機能は利用可能。

### C. 将来の拡張ポイント (Visual Diff & Accessibility)
本仕様は、将来の拡張領域として以下を予約する。
- **`a11ySummary`**: アクセシビリティ違反件数 (`missingLabelsCount`, `contrastWarningsCount`)
- **`visualDiffRef`**: 画像差分エンジンの差分データ参照 (`URI + SHA-256`)

---

## 5. JSON Schema 定義 (UiVerificationRecord Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "UiVerificationRecord",
  "type": "object",
  "required": [
    "executionId",
    "browserSessionId",
    "schemaVersion",
    "capturedTimestamp",
    "uiAssertionResult",
    "expectedHudState",
    "actualHudState",
    "elementPresenceMap",
    "buttonInteractiveStates",
    "errorElementList",
    "loadingState",
    "uiScreenshotRef",
    "domSnapshotHash",
    "domVersion",
    "evidenceHash"
  ],
  "properties": {
    "executionId": { "type": "string", "format": "uuid" },
    "browserSessionId": { "type": "string", "format": "uuid" },
    "schemaVersion": { "type": "string", "example": "1.0" },
    "capturedTimestamp": { "type": "string", "format": "date-time" },
    "uiAssertionResult": { "type": "string", "enum": ["PASS", "FAIL", "PARTIAL"] },
    "expectedHudState": { "type": "object" },
    "actualHudState": { "type": "object" },
    "elementPresenceMap": { "type": "object" },
    "buttonInteractiveStates": { "type": "object" },
    "errorElementList": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["elementId", "message"],
        "properties": {
          "elementId": { "type": "string" },
          "message": { "type": "string" }
        }
      }
    },
    "loadingState": { "type": "string", "enum": ["IDLE", "LOADING", "COMPLETED"] },
    "uiScreenshotRef": { "type": "string", "example": "storage://evidence/ui/screenshot_b7d14d2e.png#sha256:c1d2e3..." },
    "domSnapshotHash": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" },
    "domVersion": { "type": "string", "example": "v2.1" },
    "evidenceHash": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" }
  },
  "additionalProperties": false
}
```

---

## 6. Compliance Verification (適合性アサーション)

本仕様に適合していることを検証するため、アサーションプログラムは以下を確認しなければならない。

1. コア 15 属性が全て存在し、型制約を満たすこと。
2. `expectedHudState` と `actualHudState` が存在し、対比比較が可能であること。
3. `uiAssertionResult` が `PASS`, `FAIL`, `PARTIAL` のいずれかであること。
