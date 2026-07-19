# Sandbox Manager 仕様書

## 概要
本仕様書は、プラグインを安全に実行・管理する「Sandbox Manager」の仕様を定義します。

## 構成と責務
1. **サンドボックスの動的生成と破棄 (Sandbox Lifecycle)**:
   - プラグインごとに隔離プロセス空間 `SandboxInstance` を生成・初期化・実行し、終了時または違反時に破棄するライフサイクル（CREATED ➔ INITIALIZED ➔ RUNNING ➔ SUSPENDED ➔ DESTROYED）を統治します。
2. **サンドボックスプロファイルの引き当て (Sandbox Profile)**:
   - 用途に応じた標準プロファイル（`READ_ONLY`, `NETWORK_DISABLED`, `LIMITED_NETWORK`, `FULLY_ISOLATED`）の制限規則（fileAccess, networkAllowed, resourceLimits など）を割り当てます。
3. **リソース制限 (Resource Policy)**:
   - CPU使用率、メモリ上限、ディスク書き込み、および通信接続先ドメイン等をプロセスに強制適用し、制限超過時は自動でサンドボックスインスタンスを強制終了（DESTROYED）させ、セキュリティ警告を発生させます。
