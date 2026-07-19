# Orchestration Architecture (オーケストレーション・アーキテクチャ定義書)

## 概要
AIOS v6.0 では、システムの実行に関わる層を、全体調整とスケーリングを担う **Control Plane (制御面)** と、実際の実行処理に専念する **Data Plane (データ面)** に明確に分離します。

## レイヤ構造

```text
Control Plane (実行前計画・リソース割当・回復管理)
 ├─ Orchestration Runtime       (全体調整・プラン作成)
 ├─ AutoScaling Engine          (動的レプリカ伸縮)
 ├─ Placement Resolver          (配置ノード解決)
 ├─ Recovery Planner            (障害復旧計画)
 └─ Execution Queue             (実行待機キュー・優先度制御)
 
            │ (ディスパッチ・割当て指示)
            ▼
            
Data Plane (実際の実行・プロセス管理)
 ├─ Execution Runtime           (低レベルプロセス・コンテナの起動)
 ├─ Workflow Runtime            (DAGベースワークフロー実行制御)
 ├─ Service Runtime             (個別サービスのライフサイクル)
 └─ Plugin Runtime              (サンドボックスプラグインのロードと実行)
```

## 利点
1. **スケーラビリティの向上**: Control Plane と Data Plane が疎結合になることで、将来的により多くの実行ノードや分散クラスタ環境へ拡張しやすくなります。
2. **監査性と自律性**: リソース監視とスケーリング判定、復旧計画が完全にイベント駆動で追跡可能になり、障害時の自動リカバリが独立して機能します。
