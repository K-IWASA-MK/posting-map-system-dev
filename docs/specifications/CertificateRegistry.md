# Certificate Registry 仕様書

## 概要
本仕様書は、各デジタルアイデンティティに紐付く検証鍵証明書の発行、更新（Renewal）、失効判定を担う証明書レジストリ（Certificate Store）の仕様を定義します。

## 証明書モデル (Certificate)
- `certificateId`: 証明書の一意識別ID
- `identityId`: 紐付く DigitalIdentityID
- `publicKey`: 電子署名検証用の公開鍵情報
- `status`: 証明書のライフサイクル状態（`ISSUED`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED`）
- `issuedAt`: 発行時刻（タイムスタンプ）
- `expiresAt`: 有効期限時刻（タイムスタンプ）
- `revokedAt`: 失効処理時刻（ある場合）

## 証明書の失効リスト (CRL: Certificate Revocation List)
- 侵害が検出された、または手動失効された証明書IDは CRL ストアに追加されます。
- `verifyValidity(certificateId)` 判定時に CRL に含まれる証明書は即時に `REVOKED` と判定され、対応する ID によるすべての電子署名および認可リクエストは拒否されます。
