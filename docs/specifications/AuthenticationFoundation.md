# Authentication Foundation Specification (Sprint 4 Phase S4-1)

## 1. 概要
本設計書は、POSTING MAP API パイプラインにおける利用者識別（Identity）の認証処理を標準化・モジュール化するための認証基盤（Authentication Foundation）の仕様を定義します。

認証（Authentication: **Who are you?**）と認可（Authorization: **What are you allowed to do?**）を厳密に分離し、API 利用者のアイデンティティ情報を `AuthenticationContext` として後続処理へ引き渡します。

## 2. 認証処理の順序とパイプライン配置
API リクエスト処理フローの最外周である堅牢化ゲートウェイの直後に配置します。

```
HTTP Request
     │
     ▼
HardeningPipeline
     │
     ▼
AuthenticationPipeline ── (認証失敗時は 401 遮断、Anonymous許可時は通過)
     │
     ▼
ValidationPipeline
     │
     ▼
ApiRouter
     │
     ▼
EndpointHandler
```

---

## 3. データモデル

### 3.1 IdentityType
認証対象の種別を明示します。
* `USER`: LINE ログイン利用者など人間アカウント。
* `SERVICE`: AIOS やバッチ連携などのマシン・システムアカウント。
* `ANONYMOUS`: 認証情報を持たない、または未ログインのゲストアカウント。

### 3.2 AuthenticationMethod
使用された認証方法。
* `API_KEY`: クエリ/ヘッダーによるAPIキー照合。
* `LIFF`: LINE LIFF ID トークン。
* `INTERNAL_SERVICE`: 内部連携認証。
* `NONE`: 匿名。

### 3.3 AuthenticationContext
認証結果を表す不変オブジェクト。
* `identityId`: 一意識別ID。
* `identityType`: `IdentityType` enum 値。
* `authenticationMethod`: `AuthenticationMethod` enum 値。
* `authenticated`: 認証成功フラグ。
* `issuedAt`: 発行時刻タイムスタンプ。
* `metadata`: トークンペイロードやクライアントバージョンなどの追加情報。

---

## 4. 解決優先順位 (IdentityResolver Decision Rule)
リクエストからどの Provider を使用して認証を行うかの決定規則は、以下の固定優先順位で解決します（決定論の保証）。

1. **Service Auth**: リクエストヘッダー `x-service-auth` が存在する場合 -> `ServiceIdentityProvider`
2. **API Key**: リクエストクエリ/ヘッダー `apiKey` もしくは `x-api-key` が存在する場合 -> `ApiKeyIdentityProvider`
3. **LIFF Token**: リクエストクエリ/ヘッダー `liffToken` もしくは `authorization` ヘッダーが存在する場合 -> `LIFFIdentityProvider`
4. **Anonymous**: いずれの認証情報も存在しない場合 -> `AnonymousIdentityProvider` (認証失敗かつポリシー上匿名が許可されていれば ANONYMOUS コンテキストを割り当てる)

---

## 5. エラーコード定義
認証失敗時に返却される例外コードは `ApiException` と `ExceptionHandler` の枠組みを利用し、一元的に 401 Unauthorized として処理されます。

| エラーコード | 例外名称 | 原因 / 内部メッセージ |
|---|---|---|
| `PM-AUT-001` | UNAUTHENTICATED | 認証情報が存在せず、かつ匿名アクセスが不許可 |
| `PM-AUT-002` | INVALID_API_KEY | API キーが無効または期限切れ（スタブ判定以外） |
| `PM-AUT-003` | INVALID_LIFF_TOKEN | LIFF トークンが無効または検証失敗 |
| `PM-AUT-004` | IDENTITY_NOT_FOUND | 解決されたアイデンティティ情報がデータベースに存在しない |

> [!NOTE]
> 開発・基盤検証フェーズでは、認証情報の検証ロジックは「開発用スタブ（Stub Only）」として実装され、`valid-api-key` および `valid-liff-token` が渡された場合のみ成功とみなします。本番実装では `SecretProvider` や実際のリレーショナルデータベース照合に差し替えられます。
