# Execution Delegation (実行委譲プロトコル仕様書)

## 概要
他ドメインやリモートノードへプロセス実行を委譲する際の通信および認可フローの規約です。

## 正常系委譲フロー (Event Flow)
1. **ExecutionRequested**: 分散実行要求の受領。
2. **NodeSelected**: 最適リモートノードの選定完了。
3. **RemoteAttestationVerified**: 委譲先ノードの整合性（Attestation）が正常に確認された。
4. **ExecutionDelegated**: 発行・署名された `ExecutionToken` を付与して委譲を送信。
5. **ExecutionAccepted**: 受信側ノードで検証が成功し、実行を受理。
6. **ContainerStarted**: 受信側コンテナの起動開始。
7. **ExecutionCompleted**: プロセス実行完了。
8. **ExecutionVerified**: 実行結果ハッシュと署名の正当性確認。
9. **LedgerReplicated**: 結果の分散レジャー同期完了。
