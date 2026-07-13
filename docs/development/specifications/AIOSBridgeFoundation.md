# AIOS Bridge Foundation Specification (Sprint 4 Phase S4-5)

## 1. 概要
本設計書は、POSTING MAP と AIOS (AI Operations System) を接続する疎結合なブリッジ層（AIOS Bridge: **Execution Platform ⇔ AIOS**）の基盤仕様を定義します。

AIOS との直接通信方式やデータ構造を Bridge Layer に隠蔽し、相互のデータ不整合や通信仕様変更時の影響を最小化します。

## 2. 処理の順序とパイプライン配置
API リクエスト処理フローにおいて、`FeatureAccessPipeline` の直後、`ValidationPipeline` の前段に配置します。

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
LicensingPipeline
     │
     ▼
FeatureAccessPipeline
     │
     ▼
AIOSBridgePipeline ── (エラー発生時・ポリシー違反時は 503 遮断)
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

## 3. メッセージ定義と通信方向

### 3.1 BridgeMessage (ブリッジメッセージ構造)
* `messageId`: ユニークなメッセージID。
* `messageType`: メッセージ区分。
* `timestamp`: 生成タイムスタンプ。
* `source`: 送信元。
* `destination`: 送信先。
* `payload`: 運搬するペイロード（Record型）。
* `protocolVersion`: メッセージプロトコルバージョン（拡張予定に対応）。
* `correlationId`: トラッキング用の相関ID。

### 3.2 BridgeDirection (向き)
* `POSTING_MAP_TO_AIOS`: プラットフォームから AIOS への送信。
* `AIOS_TO_POSTING_MAP`: AIOS からプラットフォームへの応答/通知。

### 3.3 BridgeStatus (ステータス)
* `CONNECTED`: 通信確立状態。
* `DISCONNECTED`: 通信切断。
* `DEGRADED`: 遅延または部分的機能制限。
* `UNKNOWN`: 初期化前、または状態不明。
* `INITIALIZING`: 初期化処理中（拡張ステータス）。

---

## 4. エラーコード定義

| エラーコード | 例外名称 | 原因 / 内部メッセージ | HTTP Status |
|---|---|---|---|
| `PM-BRG-001` | BRIDGE_DISABLED | システム設定でブリッジ接続が無効化されている | 503 |
| `PM-BRG-002` | BRIDGE_UNAVAILABLE | プロバイダ接続がタイムアウトまたは切断状態 | 503 |
| `PM-BRG-003` | BRIDGE_TIMEOUT | AIOS からのレスポンスが規定時間内に受信できない | 503 |
| `PM-BRG-004` | MESSAGE_MAPPING_FAILED | リクエストデータまたはレスポンスデータのマッピング失敗 | 503 |
