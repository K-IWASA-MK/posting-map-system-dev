# Digital Identity 仕様書

## 概要
本仕様書は、AIOS プラットフォーム上で動作するすべての実行主体（Runtimes, Plugins, Agents, Applications, Users）に適用されるデジタルアイデンティティ（DigitalIdentity）の標準スキーマを定義します。

## デジタル ID スキーマ (DigitalIdentity Schema)
- `identityId`: アイデンティティの一意の識別キー
- `namespace`: 名前空間（`SYSTEM`, `RUNTIME`, `PLUGIN`, `AGENT`, `APPLICATION`, `USER`）
- `subjectType`: 主体タイプ（`RUNTIME`, `PLUGIN`, `AGENT`, `APPLICATION`）
- `subjectId`: 主体の実体ID（例: `aios.quality`, `plugin-logger`）
- `publicKey`: 電子署名検証用の公開鍵データ（不変）
- `certificateId`: 関連付けられたアクティブな証明書ID
- `status`: アイデンティティのライフサイクル状態（`REGISTERED`, `VERIFIED`, `SUSPENDED`, `REVOKED`）
- `createdAt`: 登録タイムスタンプ
- `updatedAt`: 最終更新タイムスタンプ
