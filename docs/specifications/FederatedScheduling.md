# Federated Scheduling (フェデレーション・スケジューリング仕様書)

## 概要
分散ノードおよびマルチドメイン環境における負荷状況、性能要件、および信頼性評価を考慮したジョブ配置最適化のスケジューリング規約です。

## 主要な戦略
1. **NodeCapabilityProfile適合**: 実行対象コンテナが必要とする `runtimeClasses` や `runtimeCapabilities` に適合するノードのみを選定。
2. **NodeHealth負荷分散**: 各ノードのCPU・メモリ・GPU負荷を `NodeHealthEvaluator` で収集・スコア化し、低負荷かつ信頼性の高いノードを選択。
