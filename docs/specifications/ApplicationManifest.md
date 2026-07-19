# Application Manifest 仕様書

## 概要
本仕様書は、アプリケーションパッケージをインポート・展開するための `ApplicationManifest` スキーマ構造を定義します。

## スキーマ構造
1. **パッケージ署名 (ApplicationSignature)**:
   - アプリケーション ID、マニフェスト全体のハッシュ、暗号署名、証明書 ID。
2. **環境プロファイル (ApplicationProfile)**:
   - `profileId`: プロファイルの一意識別ID
   - `environment`: 対象実行環境（DEVELOPMENT, STAGING, PRODUCTION）
   - `configuration`: 環境固有の設定パラメーター
   - `requiredCapabilities`: 必要とされる capabilities の定義
3. **ワークフローとサービスリファレンス**:
   - アプリケーションを構成する依存ワークフローID群（workflows）、および依存サービスID群（services）。
