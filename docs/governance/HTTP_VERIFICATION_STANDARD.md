# HTTP Verification Standard Specification

**Standard Identifier**: `AIOS-STD-RV-003`  
**Title**: HTTP Verification Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: Runtime Verification Foundation  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と理念 (Purpose & Philosophy)

本仕様書は、AIOS Runtime が実施する API および Web 通信の HTTP トランザクション（Request, Response, 認証ヘッダー, 状態コード, レスポンスボディハッシュ）を、改ざん不能な不変証跡（HTTP Verification Evidence）として構造化・記録するための最高基準を定める。

特に、POSTING MAP で経験した認証未送信事故（`PM-AUT-001`）の再発を防ぐため、**Authentication Evidence (認証証跡)** および **Correlation Tracing (相互追跡キー)** を標準に組み込む。

### 憲法基本原則
> **`HTTP Exchange Is Evidence Principle`**  
> すべての HTTP 通信トランザクションおよびその認証伝達属性は、曖昧さや推測を排した暗号的検証証跡（Evidence）として不変記録されなければならない。認証情報の欠落は即時に明示的証跡として抽出されなければならない。

---

## 2. アーキテクチャ位置付け (Architectural Placement)

Generation 9 の組織統制モデルに従い、本標準は **AIOS Runtime の「HTTP 通信動的証跡収集能力」** として位置付けられ、`executionId` および `correlationId` を通じてフロントエンド fetch とバックエンド API 間の相互トレースを担保する。

```
Execution Session (executionId / browserSessionId / correlationId)
       │
       ├── RV-1: BrowserVerificationRecord (URL, Status, Screenshot)
       ├── RV-2: DeveloperToolsRecord (Console, HAR, Storage, Exceptions)
       └── RV-3: HttpVerificationRecord (Request, Response, Auth Evidence)
```

---

## 3. Core HTTP Evidence Schema (コア属性)

すべての HTTP Verification Evidence レコードは、以下の属性を保持しなければならない。

| 属性名 (Attribute) | 型 (Type) | 必須 | 説明 (Description) |
|---|---|---|---|
| `executionId` | `String` (UUID v4) | 必須 | 単一実行を全スプリント（RV-1 ~ RV-6）で横断識別するキー。 |
| `browserSessionId` | `String` (UUID v4) | 必須 | 親 Browser Session キー。 |
| `requestId` | `String` (UUID v4) | 必須 | 単一 HTTP トランザクション識別キー。 |
| `correlationId` | `String` (UUID v4) | 必須 | フロントエンドとバックエンドを結ぶ分散追跡キー。 |
| `schemaVersion` | `String` | 必須 | 本仕様のバージョン (例: `"1.0"`)。 |
| `capturedTimestamp` | `String` (ISO 8601) | 必須 | 通信が記録された日時 (UTC)。 |
| `requestUrl` | `String` (URI) | 必須 | 対象 API / 通信エンドポイント URL。 |
| `requestMethod` | `String` (Enum) | 必須 | HTTP メソッド (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` 等)。 |
| `authSource` | `String` (Enum) | 必須 | 認証情報の伝達経路 (`Authorization_Header`, `Query_Parameter`, `API_Key`, `Service_Auth`, `NONE`)。 |
| `authenticationResult` | `String` (Enum) | 必須 | 認証の成否 (`SUCCESS`, `FAILED`, `NOT_PROVIDED`)。 |
| `responseStatus` | `Integer` | 必須 | HTTP ステータスコード (200, 401, 500 等)。 |
| `responseClassification` | `String` (Enum) | 必須 | 高レベル分類 (`SUCCESS`, `CLIENT_ERROR`, `SERVER_ERROR`, `NETWORK_FAILURE`, `AUTH_FAILURE`)。 |
| `requestDurationMs` | `Integer` | 必須 | リクエスト開始から完了までのレイテンシ (ミリ秒)。 |
| `retryCount` | `Integer` | 必須 | Runtime が実施した再試行回数 (標準: 0)。 |
| `requestHeadersHash` | `String` (SHA-256) | 必須 | 機密除去済み Request Headers の SHA-256 ハッシュ。 |
| `requestPayloadHash` | `String` (SHA-256) | 必須 | リクエスト Body の SHA-256 ハッシュ。 |
| `responseBodyHash` | `String` (SHA-256) | 必須 | レスポンス Body の SHA-256 ハッシュ。 |
| `evidenceHash` | `String` (SHA-256) | 必須 | 本 JSON レコード全体の SHA-256 不変ハッシュ。 |

---

## 4. 詳細領域の仕様分類 (Detailed Specifications)

### A. Authentication Evidence (認証証跡モデル)
通信発生時、`authSource` と `authenticationResult` は非曖昧に記録され、`PM-AUT-001` 等の認証エラー原因を直ちに証明する。

- **`Authorization_Header`**: `Authorization: Bearer <token>` による正則な認証
- **`Query_Parameter`**: `?liffToken=<token>` によるクエリ注入認証
- **`API_Key`**: `x-api-key` ヘッダー/クエリによる認証
- **`Service_Auth`**: 内部サービス間キーによる認証
- **`NONE`**: 認証情報未付与 (`authenticationResult` = `NOT_PROVIDED`)

### B. Response Classification (レスポンス分類)
Reviewer AI および RV-6 Gate ポリシーの判定を自動化するため、ステータスコードを以下のようにマッピング分類する。

- **`SUCCESS`**: HTTP 2xx
- **`CLIENT_ERROR`**: HTTP 4xx (401 以外)
- **`AUTH_FAILURE`**: HTTP 401 / 403 または認証失敗
- **`SERVER_ERROR`**: HTTP 5xx
- **`NETWORK_FAILURE`**: Transport / DNS / Timeout / CORS 障害

---

## 5. JSON Schema 定義 (HttpVerificationRecord Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "HttpVerificationRecord",
  "type": "object",
  "required": [
    "executionId",
    "browserSessionId",
    "requestId",
    "correlationId",
    "schemaVersion",
    "capturedTimestamp",
    "requestUrl",
    "requestMethod",
    "authSource",
    "authenticationResult",
    "responseStatus",
    "responseClassification",
    "requestDurationMs",
    "retryCount",
    "requestHeadersHash",
    "requestPayloadHash",
    "responseBodyHash",
    "evidenceHash"
  ],
  "properties": {
    "executionId": { "type": "string", "format": "uuid" },
    "browserSessionId": { "type": "string", "format": "uuid" },
    "requestId": { "type": "string", "format": "uuid" },
    "correlationId": { "type": "string", "format": "uuid" },
    "schemaVersion": { "type": "string", "example": "1.0" },
    "capturedTimestamp": { "type": "string", "format": "date-time" },
    "requestUrl": { "type": "string", "format": "uri" },
    "requestMethod": { "type": "string", "enum": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] },
    "authSource": { "type": "string", "enum": ["Authorization_Header", "Query_Parameter", "API_Key", "Service_Auth", "NONE"] },
    "authenticationResult": { "type": "string", "enum": ["SUCCESS", "FAILED", "NOT_PROVIDED"] },
    "responseStatus": { "type": "integer", "minimum": 100, "maximum": 599 },
    "responseClassification": { "type": "string", "enum": ["SUCCESS", "CLIENT_ERROR", "SERVER_ERROR", "NETWORK_FAILURE", "AUTH_FAILURE"] },
    "requestDurationMs": { "type": "integer", "minimum": 0 },
    "retryCount": { "type": "integer", "minimum": 0 },
    "requestHeadersHash": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" },
    "requestPayloadHash": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" },
    "responseBodyHash": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" },
    "evidenceHash": { "type": "string", "pattern": "^[a-fA-F0-9]{64}$" }
  },
  "additionalProperties": false
}
```

---

## 6. Compliance Verification (適合性アサーション)

本仕様に適合していることを検証するため、アサーションプログラムは以下を確認しなければならない。

1. コア 18 属性が全て存在し、型制約を満たすこと。
2. `authSource` が `Authorization_Header`, `Query_Parameter`, `NONE` 等の標準区分であること。
3. `responseClassification` が `SUCCESS`, `AUTH_FAILURE`, `NETWORK_FAILURE` 等の正則分類であること。
