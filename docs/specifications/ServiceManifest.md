# Service Manifest 仕様書

## 概要
本仕様書は、サービスパッケージを安全にインポートするための `ServiceManifest` スキーマ構造を定義します。

## スキーマ構造
1. **アイデンティティ (ServiceIdentity)**:
   - 一意なサービス ID、公開事業者 ID、マニフェストハッシュ、暗号署名、証明書ID。
2. **依存ポリシー (ServiceDependency)**:
   - 依存先サービス ID、バージョン制約（semver 準拠）、および必要とする Capability リスト。
3. **実行オプション (ServiceConfiguration)**:
   - 同時実行上限（maxConcurrency）等の実行制御パラメーター。
