# Container Architecture (コンテナ分離実行アーキテクチャ定義書)

## 概要
データプレーン層における安全なコンテナ分離実行のアーキテクチャ関係を示します。

## コントロール・データプレーン構成

```text
  Control Plane (Orchestration Runtime)
            │
            ▼ (決定した ResourceAllocation / QueueItem / Image)
            
  Data Plane (Execution Runtime Layer)
   ├─ Container Runtime
   │    ├─ ContainerRegistry (コンテナ登録・追跡)
   │    ├─ ContainerLauncher (コンテナ生成と起動制御)
   │    └─ ContainerSupervisor (CPU/メモリ/GPUクォータ超過・健康監視)
   │
   ├─ Sandbox Engine
   │    ├─ SandboxPolicy (Identity -> Trust -> Security -> Policy 評価順序)
   │    ├─ CapabilityFilter (特権APIフィルタ)
   │    ├─ SecretIsolation (SecretState 状態遷移)
   │    ├─ FilesystemPolicy (パス・アクセス権限制御)
   │    └─ NetworkPolicy (TCP/UDP送信フィルタ)
   │
   └─ Isolated Process (実際のサンドボックス化されたプロセス)
```
これにより、すべてのコンテナ起動がポリシー評価順序を強制され、実行時の状態変化が完全に監査可能となります。
