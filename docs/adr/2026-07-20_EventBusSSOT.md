# Decision Log: EventBus Single Source of Truth (SSOT) Restoration

**Date**: 2026-07-20  
**Author**: Lead Architect / Gemini 3.5 Flash  
**Status**: Decided

---

## 1. 決定事項 (Decision)
AIOS v6.0 において、`sdk/core/event/AIOSEventBus` をプラットフォーム唯一 of 公式イベントバス（SSOT）として指定する。
旧来の `sdk/core/eventbus/EventBus`（25ファイル）は非推奨（Deprecated）とし、段階的な隔離ステップを経て完全に廃止・削除する。

## 2. 理由 (Rationale)
* **情報の単一ソース化 (SSOT)**: 同一の役割を持つイベントバスが2系統並存することは、開発者の認知負荷を高め、イベントフローの追跡を困難にする。
* **密結合の解消**: 旧 `EventBus` は `EventEnvelope`, `EventChannel`, `EventType` などの詳細な構造体やEnumと密結合しており、コアOS層の変更が周辺モジュールに波及しやすい。
* **単一責任の原則 (SRP)**: `AIOSEventBus` に優先度やチャネルの処理能力を組み込まずにシンプルな Pub/Sub として保ち、個別の Dispatcher (Projection, Telemetry) 側で受信イベントのフィルタリングやソートを行うことで、バス自体の責任と複雑度の上昇を防ぐ。

## 3. 採用案 (Alternative Selected)
* `AIOSEventBus` は `publish(event)` と `subscribe(eventType, handler)` の最小限のAPIのみを提供する。
* テレメトリ収集や射影（Projection）など、順序や優先度が重要なコンポーネントは、ハンドラー受信後の内部ディスパッチ処理において優先度キューやフィルタリングの制御を自律的に行う。

## 4. 却下案 (Alternative Rejected)
* **旧 `EventBus` の維持、または機能統合**: `AIOSEventBus` に旧 EventBus の `EventChannel` や `Priority` の仕組みを移植して肥大化させる案。これはOSのコア機能であるイベントバスを必要以上に複雑化させ、後続の軽量プラグイン実行時のオーバーヘッドとなるため却下。

## 5. 将来見直す条件 (Review Criteria)
* 非同期イベントの流量が著しく増加し、受信側での単純なフィルタリングではCPUボトルネックが発生するため、イベントバス自体にトピックベースの動的ルーティングやバックプレッシャー制御を組み込む必要が生じた場合。

## 6. 影響 (Consequences)

### Positive (良影響)
- EventBusのSSOTが確立され、システム全体のメッセージフローが一意になる。
- コアOS層のイベントバスが単純なPub/Subになり、責務と複雑度が大きく削減される。
- Dispatcher（Projection, Telemetry）個別の内部要件に合わせて、優先度やフィルタリング機能を自律的かつ疎結合に拡張できるようになる。

### Negative (悪影響)
- イベント受信側である各Dispatcherでフィルタリングや順序制御を行う責任が増える。
- 旧 `EventBus` を参照していたコードやユニットテストについて、`AIOSEvent` への移行コストが発生する。

