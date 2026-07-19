# Execution Token (実行承認トークン仕様書)

## 概要
`ExecutionToken` は、委譲ジョブの認証、改ざん防止、およびリプレイ攻撃防止を目的とした、暗号署名付きデータモデルです。

## スキーマ定義
```typescript
interface ExecutionToken {
  tokenId: string;
  executionId: string;
  sessionId: string;
  issuerNode: string;
  targetNode: string;
  workflowId: string;
  applicationId: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  signature: string;
}
```
署名検証は `FederationRuntime` を経由して行われ、有効期限（expiresAt）および過去のnonceとの重複チェック（リプレイ攻撃耐性）が適用されます。
