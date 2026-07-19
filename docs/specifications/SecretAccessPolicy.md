# Secret Access Policy 仕様書

## 概要
本仕様書は、機密情報（Secrets）の取得経路の制御、および Secret Broker の監査判定ポリシーを規定します。

## シークレット仲介ルール (Secret Access Brokerage)
- プラグインおよびコンポーネントは、環境変数や静的構成ファイルから直接シークレット情報にアクセスしてはなりません（No Direct Secret Access）。
- すべてのシークレット取得リクエストは、Security Runtime の Secret Broker 仲介 API を経由しなければなりません。
- リクエスト時に `SecurityContext` と `CapabilityToken` が検証され、認可されたリクエストにのみ値が返されます。
- シークレットの読み出し要求は、成否に関わらずすべて `SecretAccessEvaluated` イベントとして記録され、監査証跡が不変元帳に蓄積されます。
