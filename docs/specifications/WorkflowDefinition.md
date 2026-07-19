# Workflow Definition 仕様書

## 概要
本仕様書は、Workflow Runtime 内に登録されるグラフ構造モデル `WorkflowDefinition` のスキーマ定義を規定します。

## スキーマ構造
1. **メタデータ**:
   - 一意な識別子（workflowId）、バージョン（version）、起動承認ポリシー（approvalPolicy: STRICT-APPROVAL 等）。
2. **ノード定義 (WorkflowNode)**:
   - nodeId, type, action, config, requiredCapabilities。各ノードの入出力およびリトライ・タイムアウト要件を規定します。
3. **エッジ接続定義 (WorkflowEdge)**:
   - from, to, および遷移時に検証される条件式（condition）。
4. **終端境界ノード**:
   - 開始境界（entryNode）、終了境界（exitNode）を必須とし、接続性を保証します。
