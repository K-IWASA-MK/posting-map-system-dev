# Container Runtime (コンテナランタイム仕様書)

## 概要
`ContainerRuntime` は、実行の安全性を担保するため、プロセスをコンテナイメージ定義に基づき、隔離された実行コンテキストとして配備、起動、監視、破棄するランタイムです。

## 主な責務
1. **コンテナ登録とライフサイクル管理**: `ContainerDefinition` と `ContainerLifecycle` に準拠したライフサイクル管理。
2. **コンテナ監視 (Supervision)**: コンテナの資源利用状況およびプロセス動作を実時間監視し、ポリシー違反やクラッシュ時に復旧エンジンへ通知。
3. **能力登録**: `CONTAINER`, `SANDBOX_EXECUTION`, `RESOURCE_ISOLATION`, `PROCESS_SUPERVISION`, `SECRET_ISOLATION` の能力をRuntime Serviceへエクスポート。
