# Workflow Runtime 仕様書

## 概要
本仕様書は、有向非巡回グラフ（DAG）に基づき、登録された複数のノードの接続整合性の検証、順序決定、および順次実行を司る「Workflow Runtime」の仕様を定義します。

## 構成と責務
1. **ワークフロー定義 (Workflow Registry)**:
   - ワークフロー定義メタデータ `WorkflowDefinition` を管理し、対応する `WorkflowVersion` に基づいて整合性を維持します。
2. **グラフの静的検証 (Workflow Validator)**:
   - 登録されたワークフローのトポロジを解析し、循環参照（ループ）や孤立した未接続ノードが存在しないかを検証します。
3. **決定論的実行エンジン (Workflow Executor)**:
   - トポロジカルソート順に従ってノード（WorkflowNode）を順次実行し、途中経過（WorkflowCheckpoint）の記録を行うことで、障害中断時の再開・復元能力を提供します。
