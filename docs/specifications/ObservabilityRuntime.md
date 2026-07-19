# Observability Runtime 仕様書

## 概要
本仕様書は、AIOS における実行状態、イベント、メトリクス、スパン、ログ、およびアラートを一元的に収集・保管する「Observability Runtime」の仕様を定義します。

## 構成と責務
Observability Runtime は、EventBus から受信した全テレメトリをパイプラインを介して集約し、以下の情報を提供するシングル・ソース・オブ・トゥルース（SST）として動作します。
1. **Telemetry 収集**: EventBus を介した非侵入的（Passive）なイベントストリーム受信。
2. **ログ / メトリクス集約**: 実行環境のアクティブ数、状態、エラーおよび警告の件数算出。
3. **Trace 管理**: 実行履歴（TraceId, ExecutionId）の開始から終了（Duration）までの追跡。
4. **アラート判定**: AlertRule に基づく状態監査と Cooldown 抑制。
5. **不変 Projection**: deepFreeze された読取専用スナップショットの提供。
