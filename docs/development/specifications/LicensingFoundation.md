# Licensing & Edition Foundation Specification (Sprint 4 Phase S4-3)

## 1. 概要
本設計書は、POSTING MAP API パイプラインにおけるエディション判定およびライセンス状況検証（Licensing: **Is this feature available for this edition?**）の基盤仕様を定義します。

認可（Authorization）とは完全に独立させ、利用可能な Edition や有効期限を `LicenseContext` として管理・評価します。

## 2. 認可・ライセンス処理の順序とパイプライン配置
API リクエスト処理フローにおいて、`AuthorizationPipeline` の直後、`ValidationPipeline` の前段に配置します。

```
HTTP Request
     │
     ▼
HardeningPipeline
     │
     ▼
AuthenticationPipeline
     │
     ▼
AuthorizationPipeline
     │
     ▼
LicensingPipeline ── (ライセンス違反時は 402 遮断)
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

## 3. エディション・ライセンス状態定義

### 3.1 Edition (エディション)
利用可能なプランと大小関係を定義します（決定論的比較ルールの適用）。

$$\text{COMMUNITY} < \text{STANDARD} < \text{PROFESSIONAL} < \text{ENTERPRISE}$$

* `COMMUNITY`: 無料枠、基本閲覧機能。
* `STANDARD`: 標準ポスティング実績記録。
* `PROFESSIONAL`: チーム配布状況管理、GPSログトラッキング、在庫表示。
* `ENTERPRISE`: 複数支部管理、外部システム連携、高信頼性 SLA。

### 3.2 LicenseStatus (ライセンス状態)
* `ACTIVE`: 有効なライセンス。
* `EXPIRED`: 期限切れライセンス。
* `SUSPENDED`: 支払遅延等による一時利用停止。
* `TRIAL`: 試用期間。
* `NONE`: ライセンスなし。

---

## 4. 解決ルール (Resolver Stub Mapping)
開発・基盤検証フェーズでは、認証情報の identityId に応じた決定論的 Stub マッピングを適用します。

| 認証IdentityId | 解決Edition | 解決LicenseStatus |
|---|---|---|
| `service-aios-bridge-stub` | `ENTERPRISE` | `ACTIVE` |
| `user-api-key-stub` | `PROFESSIONAL` | `ACTIVE` |
| `user-liff-stub-123` | `STANDARD` | `ACTIVE` |
| `anonymous` | `COMMUNITY` | `ACTIVE` |

---

## 5. エディション比較アルゴリズム
`LicensingPipeline` は、要求される Edition レベルが割り当てられた Edition レベル以下であることを、以下の大小関係の数値マッピングに基づいて判定します。

| Edition | 順序数値 |
|---|---|
| `COMMUNITY` | 0 |
| `STANDARD` | 1 |
| `PROFESSIONAL` | 2 |
| `ENTERPRISE` | 3 |

例: 要求が `STANDARD` (1) の場合、割り当てられたエディションが `PROFESSIONAL` (2) であれば $2 \ge 1$ のため判定成功 (OK) となります。

---

## 6. エラーコード定義

| エラーコード | 例外名称 | 原因 / 内部メッセージ | HTTP Status |
|---|---|---|---|
| `PM-LIC-001` | LICENSE_REQUIRED | 有効なライセンスが存在しない（NONE） | 402 |
| `PM-LIC-002` | LICENSE_EXPIRED | ライセンス期限切れ、またはSUSPENDED状態 | 402 |
| `PM-LIC-003` | EDITION_REQUIRED | 要求されるエディションプランレベルに達していない | 402 |
| `PM-LIC-004` | FEATURE_NOT_LICENSED | 指定された機能のライセンスが割り当てられていない | 402 |
