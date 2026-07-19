# Authorization Model 仕様書

## 概要
本仕様書は、AIOS 内における認可判定（Authorization Decision）および権限トークン（Capability Token）のモデル詳細を規定します。

## 権限トークン (CapabilityToken)
- `tokenId`: トークンの一意識別キー
- `principalId`: トークンを所有するサブジェクトの識別ID
- `capabilities`: 許可する操作（例: `['secrets:read', 'ledger:write']`）
- `issuedAt`: 発行タイムスタンプ
- `expiresAt`: 有効期限タイムスタンプ
- `revoked`: 明示的失効フラグ（失効時に true となり、即座に認可が無効化されます）

## 認可結果 (AuthorizationDecision)
- `decisionId`: 認可可否判断レコードの一意識別ID
- `principalId`: 認可要求主体の識別ID
- `resource`: アクセス対象リソース
- `action`: 要求アクション（read, write, execute等）
- `result`: 判定結果（`ALLOW`, `DENY`）
- `reason`: ALLOW/DENY に至った具体的な判定ポリシー理由
- `timestamp`: 認可判定タイムスタンプ
