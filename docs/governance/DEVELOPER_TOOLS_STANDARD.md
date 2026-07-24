# Developer Tools Standard Specification

**Standard Identifier**: `AIOS-STD-RV-002`  
**Title**: Developer Tools Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: Runtime Verification Foundation  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と理念 (Purpose & Philosophy)

本仕様書は、AIOS Runtime がブラウザの DevTools（F12）から取得される内部状態（Console ログ、ネットワーク失敗、ストレージ、未捕捉例外）を、改ざん不能な不変証跡（Developer Tools Evidence）として構造化・記録するための基準を定める。

### 憲法基本原則
> **`DevTools Insight Is Evidence Principle`**  
> Console エラー、トランスポートレイヤーを含むネットワーク失敗、ストレージ異変、および未捕捉例外は、開発環境で隠蔽・無視されることなく、独立して追跡可能な不変証跡（Evidence）として保存されなければならない。

---

## 2. アーキテクチャ位置付け (Architectural Placement)

Generation 9 の組織統制モデルに従い、本標準は **AIOS Runtime の「DevTools 内部状態自動収集能力」** として位置付けられ、`browserSessionId` および `executionId` をアンカーキーとして `BROWSER_VERIFICATION_STANDARD` と完全連携する。

```
Browser Session (browserSessionId / executionId)
       │
       ├── RV-1: BrowserVerificationRecord (URL, Result, Screenshot)
       └── RV-2: DeveloperToolsRecord (Console, Network HAR, Storage, Exceptions)
```

---

## 3. Core DevTools Evidence Schema (コア属性)

すべての Developer Tools Evidence レコードは、以下の属性を保持しなければならない。

| 属性名 (Attribute) | 型 (Type) | 必須 | 説明 (Description) |
|---|---|---|---|
| `browserSessionId` | `String` (UUID v4) | 必須 | 親 Browser Session の識別キー。 |
| `executionId` | `String` (UUID v4) | 必須 | 単一実行を全スプリント（RV-1 ~ RV-6）で横断識別するキー。 |
| `schemaVersion` | `String` | 必須 | 本仕様のバージョン (例: `"1.0"`)。 |
| `capturedTimestamp` | `String` (ISO 8601) | 必須 | DevTools データがキャプチャされた日時 (UTC)。 |
| `consoleLogRef` | `String` (URI/Hash) | 必須 | Console ログの不変参照 (`URI + SHA-256`)。 |
| `consoleErrorCount` | `Integer` | 必須 | `ERROR` レベルのコンソールログ発生件数。 |
| `consoleWarnCount` | `Integer` | 必須 | `WARN` レベルのコンソールログ発生件数。 |
| `uncaughtExceptions` | `Array` (Object) | 必須 | 未捕捉例外情報（`message`, `stack`, `timestamp`）。 |
| `networkHarRef` | `String` (URI/Hash) | 必須 | Network HAR トランザクションログの不変参照。 |
| `networkErrorCount` | `Integer` | 必須 | HTTP 4xx/5xx およびトランスポート層障害（DNS, CORS, TLS, Timeout 等）の総件数。 |
| `storageStateRef` | `String` (URI/Hash) | 必須 | Storage Provider 抽象表現の状態参照。 |
| `evidenceHash` | `String` (SHA-256) | 必須 | 本 JSON レコード全体の SHA-256 不変ハッシュ。 |

---

## 4. 詳細領域の仕様分類 (Detailed Specifications)

### A. Network Failure 分類 (Transport & HTTP Failure)
`networkErrorCount` は、単なる HTTP ステータスコード (4xx/5xx) に留まらず、以下のトランスポート層障害を含む。

1. **HTTP Error**: 4xx, 5xx ステータスコード
2. **Transport Error**: `DNS_FAILURE`, `TLS_HANDSHAKE_ERROR`, `CONNECTION_RESET`, `TIMEOUT`
3. **Security / Policy Error**: `CORS_BLOCKED`, `CONTENT_SECURITY_POLICY_BLOCKED`
4. **Lifecycle Error**: `REQUEST_CANCELED`, `REQUEST_ABORTED`

### B. Console Log レベル区分 (Console Taxonomy)
Console ログは以下の 4 レベルで分類・記録され、後続の RV-6 Gate ポリシー（例: `ERROR = FAIL`, `WARN = WARN`）の評価基盤となる。

- `ERROR`: 未捕獲例外、実行阻害エラー
- `WARN`: 非推奨 API、リダイレクト警告、パフォーマンス注意
- `INFO`: アプリケーション情報ログ
- `DEBUG`: 開発デバッグ出力

### C. Storage Provider 抽象化 (Storage Abstraction)
`storageStateRef` は、単一のキー・バリューに依存せず、以下の 4 種の Storage Provider 状態を不変形式で集約記録する。

- `LocalStorage`
- `SessionStorage`
- `IndexedDB`
- `Cookies`

---

## 5. JSON Schema 定義 (DeveloperToolsRecord Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DeveloperToolsRecord",
  "type": "object",
  "required": [
    "browserSessionId",
    "executionId",
    "schemaVersion",
    "capturedTimestamp",
    "consoleLogRef",
    "consoleErrorCount",
    "consoleWarnCount",
    "uncaughtExceptions",
    "networkHarRef",
    "networkErrorCount",
    "storageStateRef",
    "evidenceHash"
  ],
  "properties": {
    "browserSessionId": {
      "type": "string",
      "format": "uuid"
    },
    "executionId": {
      "type": "string",
      "format": "uuid"
    },
    "schemaVersion": {
      "type": "string",
      "example": "1.0"
    },
    "capturedTimestamp": {
      "type": "string",
      "format": "date-time"
    },
    "consoleLogRef": {
      "type": "string",
      "example": "storage://evidence/logs/console_b7d14d2e.log#sha256:f2ca1bb..."
    },
    "consoleErrorCount": {
      "type": "integer",
      "minimum": 0
    },
    "consoleWarnCount": {
      "type": "integer",
      "minimum": 0
    },
    "uncaughtExceptions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["message", "timestamp"],
        "properties": {
          "message": { "type": "string" },
          "stack": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    },
    "networkHarRef": {
      "type": "string",
      "example": "storage://evidence/har/network_b7d14d2e.har#sha256:a8c9d1..."
    },
    "networkErrorCount": {
      "type": "integer",
      "minimum": 0
    },
    "storageStateRef": {
      "type": "string",
      "example": "storage://evidence/storage/providers_b7d14d2e.json#sha256:d4e5f6..."
    },
    "evidenceHash": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{64}$"
    }
  },
  "additionalProperties": false
}
```

---

## 6. Compliance Verification (適合性アサーション)

本仕様に適合していることを検証するため、アサーションプログラムは以下を確認しなければならない。

1. コア属性が全て存在し、型制約（`capturedTimestamp`, `executionId`, `evidenceHash`）を満たすこと。
2. `networkErrorCount` が HTTP 4xx/5xx および CORS/Transport 障害を含む全体件数を正確に反映していること。
3. `storageStateRef` および `consoleLogRef` が `URI + SHA-256` 不変ハッシュ構造であること。
