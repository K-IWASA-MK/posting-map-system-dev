# Distributed Execution Ledger (分散実行台帳仕様書)

## 概要
実行された委譲ジョブの記録（DistributedExecutionRecord）を各ノードおよびFederated Domain全体で不変に記録・複製同期（Ledger Replication）するための台帳仕様です。

## 記録データ定義
- `executionId`: 決定論的な実行識別ID。
- `sourceNode`: ジョブ発行元。
- `targetNode`: 実行受任ノード。
- `status`: 実行の進行・結果。
- `attestation`: 検証されたRemoteAttestationの参照。
- `startedAt` / `completedAt`: 開始・完了日時。
