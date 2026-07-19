# Workflow Execution 仕様書

## 概要
本仕様書は、Workflow Executor による順序実行、および中断したワークフローの再開・回復メカニズムを規定します。

## ノード状態管理 (Workflow Node State Machine)
各ノードは以下の状態モデルに従い状態遷移します：
`PENDING` (待機) ➔ `READY` (実行可能) ➔ `RUNNING` (実行中) ➔ `COMPLETED` (完了) | `FAILED` (失敗) | `RETRYING` (リトライ) | `SKIPPED` (スキップ) | `CANCELLED` (キャンセル)

## チェックポイント再開機構 (Workflow Checkpoint)
- **記録**: ノードの正常完了ごとに、そのノード ID、実行コンテキストのハッシュ値、およびシリアライズされた永続状態を `WorkflowCheckpoint` として記録します。
- **再開**: 実行中断時、指定された checkpointId に基づき、そのチェックポイント以前の全ノードの実行をスキップし、該当ノードから実行を即座に再開します。
- **承認統合**: STRICT-APPROVAL ポリシーが付与されたワークフローは、Security Runtime による事前認可を通らなければ実行を開始できません。
