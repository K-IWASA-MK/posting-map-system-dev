# Telemetry Pipeline 仕様書

## 概要
本仕様書は、システム内のイベント情報が Observability Runtime の状態射影（Projection）へと変換されるまでの多段階パイプライン処理フローを定義します。

## 処理段階 (Pipeline Stages)
データは以下の段階を経て、拡張性と責務分離が保証された状態で処理されます。

```
EventBus ➔ [Collector] ➔ [Normalizer] ➔ [Enricher] ➔ [Aggregator] ➔ [Projection Engine]
```

1. **Collector (収集)**:
   - EventBus から `AIOSEvent` を受信し、共通テレメトリメタデータ形式に抽出します。
2. **Normalizer (正規化)**:
   - 抽出データを共通の基底モデル `ObservabilityRecord` スキーマに標準化します。
3. **Enricher (強化)**:
   - コンテキストや環境変数、`sessionId`, `traceId`, `executionId` などの相関情報を付与します。
4. **Aggregator (集約)**:
   - 正規化・強化されたレコードを Metrics, Logs, Traces, Alerts に分類し、レジストリへ保存・再集約します。
5. **Projection (射影)**:
   - クローンしたデータを deepFreeze 処理し、不変の読取専用 Read Model として Console 向けに提供します。
