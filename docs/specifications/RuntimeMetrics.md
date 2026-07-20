# AIOS Runtime Metrics Specification (Sprint G8-7)

本稿は、AIOS Generation 8 実行環境における「Runtime Metrics（実行時メトリクス）」の設計仕様書です。本コンポーネントは、Runtime Metrics Layer として動作し、実行結果層（`ExecutionResult`）から導出される実行時観測データのモデル契約を定義します。

---

## 1. Runtime Metrics Architecture

Runtime Metrics は、実行結果レスポンス `ExecutionResultResponse`（G8-6）を入力として受け取り、実行全体の統計、監視情報、および観測データを集約したメトリクスレスポンス（`RuntimeMetricsResponse`）を構築する層です。

```
ExecutionResultResponse (G8-6)
        │
        ▼
[ RuntimeMetricsRequest ]
        │
        ▼
   RuntimeMetricsProvider (Metrics Layer)
        │
        ├── Validate Metrics Request
        ├── Resolve Runtime Metrics (Metrics Aggregation Contract)
        ├── Build Metrics State
        └── Produce Metrics Response
        │
        ▼
[ RuntimeMetricsResponse ] ──> Execution Lifecycle (Sprint G8-8)
```

---

## 2. Metrics Resolution Flow

1. **Request Intake & Validation**:
   `RuntimeMetricsRequest` を受け取り、内包される `ExecutionResultResponse` の整合性を検証します（ID等の存在チェック）。
2. **Metrics Resolution**:
   入力結果オブジェクトから、状態パラメータおよび各ステージの完了情報に基づいて観測メトリクスの抽出・集約を行います。
3. **RuntimeMetricsState & Summary Build**:
   実行ステータスをバインドした `RuntimeMetricsState`、および完了進捗をバインドした `RuntimeMetricsSummary` をそれぞれ不変モデルとして組み立てます。
4. **Response Packaging**:
   作成したメトリクスステートとサマリーを `RuntimeMetricsResponse` としてパッケージし、下流のライフサイクル制御層（G8-8）や外部監視コンポーネントへ引き渡します。

---

## 3. Runtime Contracts (実行時契約)

* **Contract-01: Immutable Models**: 
  `RuntimeMetricsState`, `RuntimeMetricsSummary`, `RuntimeMetricsRequest`, `RuntimeMetricsResponse` のすべてのプロパティは `readonly` とします。
* **Contract-02: Stateless Provider**:
  RuntimeMetricsProvider は内部状態、キャッシュ、セッション情報、および履歴データベースを保持しない純粋関数的な動作を行います。
* **Contract-03: Deterministic Metrics Resolution**:
  同一の `ExecutionResultResponse` 入力に対しては、常に全く同一の `RuntimeMetricsResponse` が決定論的に生成されることをアサーション契約とします。
* **Contract-04: No Metrics Collection**:
  Runtime Metrics はメトリクス構造の表現契約のみを担当し、実際の収集処理（タイマーの開始/停止、リソース監視、イベントログの書き出し等）は行いません。
* **Contract-05: No Persistence**:
  履歴・状態・キャッシュの永続化は行いません。
* **Metrics Aggregation Contract (メトリクス集約契約)**:
  `RuntimeMetricsProvider` は Metrics Aggregation Contract を提供します。ただし、本スプリントでは契約インタフェースの定義のみを行い、実際のメトリクス収集・計測・集約アルゴリズムは後続の Monitoring Layer で実装します。

---

## 4. 将来的な設計拡張ポイント (Architecture Extensibility)

* **`RuntimeMetricsState` のプロパティ拡張**:
  現在は最低限のIDとステータスのみですが、将来的な拡張として以下のような実行時メタデータを追加できるように拡張スロットが設計されています。
  - `metricsTimestamp`: メトリクス解決（生成）時刻の記録。
  - `metricsVersion`: メトリクススキーマのバージョン。
  - `collectionSource`: メトリクスが収集されたソースコンポーネント。
  - `correlationId`: 分散トレース用相関識別子。
* **`RuntimeMetricsSummary` の将来拡張**:
  より高度なモニタリングやパフォーマンス分析（Analytics）を行うため、以下のプロパティ追加を想定して定義されています。
  - `executionDuration`: 実行にかかったミリ秒時間（タイミングメトリクス）。
  - `averageStageDuration`: 各ステージ実行の平均ミリ秒時間。
  - `peakConcurrency`: パイプライン実行中の最大同時並列スレッド数（リソースメトリクス）。
  - `resourceUsageScore`: メモリ/CPU等の使用量を統合したリソース使用量スコア。
* **Performance Metrics (パフォーマンス測定)**:
  LLMのトークン生成速度、推論遅延、APIアクセス遅延などの特定のパフォーマンス特性をバインドし、最適化や品質管理（Quality Gate）の判定基準に利用する拡張。
* **Resource Metrics (リソース監視)**:
  実行中のメモリフットプリント、オブジェクトインスタンス生存数、IOPSなどの物理・仮想リソース使用統計をプロファイルデータとしてアタッチする拡張ポイント。
