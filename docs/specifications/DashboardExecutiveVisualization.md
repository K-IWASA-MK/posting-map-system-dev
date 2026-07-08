# Dashboard Executive Visualization Specification (DashboardExecutiveVisualization.md)

## 1. エグゼクティブビューモード仕様 (Executive View Mode)
本仕様は、複雑な 8 レイヤー（Timeline ➔ Memory）の内部データをマクロに統合・要約し、システム活動レベルおよび処理の循環構造を一目で把握できる経営層・顧客向けのデモビューを定義する。

### 画面切り替え方式 (View Mode Routing)
- UI上に操作用ボタンやタブ切り替え要素を配置することは **Observer Boundary 違反**となるため、ブラウザの URL クエリパラメータを用いて表示モードを切り替える。
  - `?view=executive` (デフォルト): エグゼクティブ・ビューを描画。
  - `?view=raw`: 従来の 8レイヤー生カードおよびイベントログ（ActivityLogCard）を描画。
- 既存のすべての生レイヤーコンポーネントファイルおよびロードタグは削除せず維持し、いつでも `?view=raw` にて生データ監視に切り替えられる二画面共存設計とする。

---

## 2. 表示要素と集約変換ルール (Executive Visual Components)

### ① Top KPI Cards (4大メトリクス)
- **Active Events**: `TimelineStore` に蓄積されているイベント総件数（最大 500）。
- **Knowledge Records**: `KnowledgeStore` に蓄積されている観測知識の総件数。
- **Pattern Count**: `PatternStore` 内の識別された発生パターン総数（最大 300）。
- **Memory Capacity**: `MemoryStore` のアーカイブ保持件数（最大 1000）および占有率（例: `345 / 1000`）。

各 KPI には、前回のデモ更新ステップでの過去値（`previousValue`）を比較元とする **Temporal Snapshot** 情報を表示する。
- 変化量（`delta`）、パーセンテージ（`deltaRate`）、および増減記号（`▲ / ▼ / ▶`）を表示。
- 静的ルールによる `statusLabel`（NORMAL / HIGH / SIGNIFICANT）をインジケータ表示。
- データ構造は `metricId`、`currentValue`、`previousValue`、`capturedAt`、`previousCapturedAt` を含み、`Object.freeze()` を適用。

---

### ② Intelligence Flow Graph
Event 発生から Memory 保存までの 8 段階のパイプライン処理フローを、接続ラインで可視化する。
- 流れ：`Event` ➔ `Timeline` ➔ `Correlation` ➔ `Graph` ➔ `Knowledge` ➔ `Insight` ➔ `Evolution` ➔ `Pattern` ➔ `Memory`
- 各ノードの横に、現在各ストアに蓄積されているデータ件数（例: `Timeline: 42`, `Memory: 18`）をバッジとして表示し、システム全体にデータが流れて資産化されるプロセスを表現する。

---

### ③ Real-time Activity Stream (メッセージ変換)
技術的なメッセージを、人間（非エンジニア）が直感的に理解しやすい非技術的表現へ、**静的ルールベースで変換**して描画する。AIによる動的推論やリスクレベル判定、および推奨のアクション提案（NG:「対応してください」等の警告）は一切含まない。

#### 変換マッピングルール：
- `Runtime database connection established successfully` ➔ `Runtime: Database link established`
- `Governance threshold alert: unexpected rule mutation rate` ➔ `Governance: Policy mutation activity detected`
- `Security validation check failed: token verification latency` ➔ `Security: Latency warning in validation key`
- `System performance optimization job completed` ➔ `Runtime: Resource optimization job completed`
- その他 ➔ 元のメッセージをそのまま簡略化

---

### ④ Intelligence Distribution
`Runtime`, `Governance`, `Quality`, `Trust`, `Simulation` カテゴリ別の発生比率（％）を計算し、美しいカラーメーターでシェア表示する。
- 計算元：`TimelineStore` に蓄積されている全イベントの `category` 分布を集計。

---

### ⑤ Evolution Status
構造変化量の統計。
- 計算元：`EvolutionStore` から、変化タイプ別（`ADD`, `MODIFY`, `REMOVE`）の差分発生件数を集計して提示。

---

### ⑥ Pattern / Memory Summary
観測パターンの集計および長期履歴メモリの蓄積ステータスを表示する。
- **パターン**: パターンカテゴリごとの出現傾向。
- **メモリ**: アーカイブされたスナップショット情報および保持リテンション容量。
