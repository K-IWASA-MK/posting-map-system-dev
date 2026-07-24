# Browser Verification Standard Specification

**Standard Identifier**: `AIOS-STD-RV-001`  
**Title**: Browser Verification Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: Runtime Verification Foundation  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と理念 (Purpose & Philosophy)

本仕様書は、AIOS Runtime がブラウザ環境（Chrome, LINE LIFF, Safari, Edge 等）においてコードを実行・動作検証した際、その動的結果を「改ざん不能な不変証跡（Browser Evidence）」として標準化・構造化して記録するための最高基準を定める。

### 憲法基本原則
> **`Browser State Is Evidence Principle`**  
> ブラウザの実行状態は単なる一時的なログやスクリーンショットではなく、検証可能性と暗号的非改ざん性を備えた不変証跡（Evidence）として記録されなければならない。いかなる完了報告（Completion Report）も、本証跡の裏付けなしに成立することはできない。

---

## 2. アーキテクチャ位置付け (Architectural Placement)

Generation 9 の組織統制モデルに従い、本標準は独立した「AI社員」ではなく、**「AIOS Runtime が持つ動的証跡収集能力（Runtime Capability）」** として定義される。

```
[Developer AI] ──(コード実装)──> [AIOS Runtime (Execution Engine)]
                                          │
                                          ▼ (自動実行 & 本標準に基づく Evidence 生成)
                                 [Browser Evidence Record]
                                          │
                                          ▼ (検証・審査)
                                    [Reviewer AI]
                                          │
                                          ▼ (組織統治)
                                     [Audit AI]
```

---

## 3. Core Browser Evidence Schema (8大必須属性)

すべての Browser Evidence レコードは、以下の 8 つのコア属性を必ず保持しなければならない。

| 属性名 (Attribute) | 型 (Type) | 必須 | 説明 (Description) |
|---|---|---|---|
| `browserSessionId` | `String` (UUID v4) | 必須 | 検証セッションを一意に識別するキー。後続スプリント (RV-2 ~ RV-6) の親キー。 |
| `targetUrl` | `String` (URI) | 必須 | 検証対象となったページの完全 URL。 |
| `loadTimestamp` | `String` (ISO 8601) | 必須 | ページのロード検証が完了した日時（UTC）。 |
| `verificationResult` | `String` (Enum) | 必須 | 検証結果判定 (`PASS`, `FAIL`, `TIMEOUT`, `ABORTED`)。 |
| `browserType` | `String` (Enum) | 必須 | 検証が実施された環境 (`Chrome`, `LINE_LIFF`, `Safari`, `Edge`)。 |
| `httpStatus` | `Integer` | 必須 | メイン HTTP レスポンスのステータスコード (例: 200, 401, 500)。 |
| `screenshotRef` | `String` (URI/Hash) | 必須 | 画面キャプチャストレージへの不変参照パスおよび SHA-256 ハッシュ。 |
| `consoleErrorCount` | `Integer` | 必須 | 検証セッション中に発生した未捕獲コンソールエラーの総件数。 |

---

## 4. JSON Schema 定義 (BrowserVerificationRecord Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BrowserVerificationRecord",
  "type": "object",
  "required": [
    "browserSessionId",
    "targetUrl",
    "loadTimestamp",
    "verificationResult",
    "browserType",
    "httpStatus",
    "screenshotRef",
    "consoleErrorCount"
  ],
  "properties": {
    "browserSessionId": {
      "type": "string",
      "format": "uuid",
      "example": "b7d14d2e-842f-4c12-98ab-30f10c660001"
    },
    "targetUrl": {
      "type": "string",
      "format": "uri",
      "example": "https://k-iwasa-mk.github.io/posting-map-system-dev/"
    },
    "loadTimestamp": {
      "type": "string",
      "format": "date-time",
      "example": "2026-07-24T18:15:00.000Z"
    },
    "verificationResult": {
      "type": "string",
      "enum": ["PASS", "FAIL", "TIMEOUT", "ABORTED"]
    },
    "browserType": {
      "type": "string",
      "enum": ["Chrome", "LINE_LIFF", "Safari", "Edge"]
    },
    "httpStatus": {
      "type": "integer",
      "minimum": 100,
      "maximum": 599,
      "example": 200
    },
    "screenshotRef": {
      "type": "string",
      "example": "storage://evidence/screenshots/20260724_b7d14d2e.png#sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    "consoleErrorCount": {
      "type": "integer",
      "minimum": 0,
      "example": 0
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true
    }
  },
  "additionalProperties": false
}
```

---

## 5. スクリーンショット参照の抽象化規定 (Storage Decoupling)

`screenshotRef` は、ストレージの実装方式（ローカルファイルシステム、S3、GCS、インメモリキャッシュ）に依存しないよう、以下のような **「URI + SHA-256 ハッシュ」** の不変表現形式を用いなければならない。

```
screenshotRef = "<storage-scheme>://<path>#sha256:<hash>"
```

- **正則例**: `file:///artifacts/screenshots/hud_check_20260724.png#sha256:a1b2c3...`
- **原則**: レコード自体の不変性を保証するため、指定されたハッシュとバイナリハッシュが一致しない場合、Evidence は無効（`INVALID`）とみなされる。

---

## 6. スプリント連携規定 (RV-2 ~ RV-6 Lifecycle Integration)

`browserSessionId` は、Runtime Verification Foundation 全体にわたるアンカーキー（Anchor Key）として機能する。

```
BrowserVerificationRecord (browserSessionId)
           │
           ├── RV-2: DeveloperToolsRecord (consoleLogRef, networkHarRef)
           ├── RV-3: HttpVerificationRecord (authHeaderSource, responseBodyHash)
           ├── RV-4: UiVerificationRecord (hudStatusMap, renderLatencyMs)
           └── RV-5: RuntimeEvidencePackage -> RV-6 Completion Gate (PASS/FAIL)
```

---

## 7. Compliance Verification (適合性アサーション)

本仕様に適合していることを検証するため、アサーションテストプログラムは以下を確認しなければならない。

1. 8 大必須属性が存在し、型の制約を満たすこと。
2. `verificationResult` が規定された Enum（`PASS`, `FAIL`, `TIMEOUT`, `ABORTED`）のいずれかであること。
3. `browserType` が `Chrome`, `LINE_LIFF`, `Safari`, `Edge` のいずれかであること。
