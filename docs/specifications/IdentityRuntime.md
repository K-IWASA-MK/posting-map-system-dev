# Identity Runtime 仕様書

## 概要
本仕様書は、AIOS プラットフォームにおける実行主体の名前空間付デジタル識別（Digital Identity）を管理する「Identity Runtime」の仕様を定義します。

## 構成と責務
1. **名前空間管理 (Identity Namespace)**:
   - IDの衝突を回避するため、`SYSTEM`, `RUNTIME`, `PLUGIN`, `AGENT`, `APPLICATION`, `USER` の各名前空間に分離してアイデンティティを管理します。
2. **アイデンティティ登録と失効 (Identity Lifecycle)**:
   - 主体のライフサイクル状態（`REGISTERED` ➔ `VERIFIED` ➔ `SUSPENDED` ➔ `REVOKED`）を統治します。
3. **証明書発行連携**:
   - アイデンティティ登録時に一意な証明書を発行し、`CertificateIssued` イベントを発行して関係モジュールへ通知します。
