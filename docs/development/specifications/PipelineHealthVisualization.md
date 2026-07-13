# Pipeline Health Visualization Specification

AIOS Dashboard Executive View におけるデータ処理パイプラインの客観的な状態提示（Pipeline State / Health）に関する定義書。
本仕様は AI による動的な主観的診断や異常アラートを徹底的に排し、観測された静的な決定論的メトリクスのみを提示する。

---

## 1. Pipeline Health Object Schema

データストアから抽出・加工され、各UIカードへと受け渡される個別パイプライン層のメトリクス構造体。Object 生成時に `Object.freeze()` のアタッチを必須とする。

```typescript
interface PipelineHealthNode {
  layerName: string;            // レイヤーの名称 (e.g. "Timeline", "Knowledge", "Pattern", "Memory")
  processedCount: number;       // 処理済みレコード数
  previousCount: number;        // 前ステップ等の比較過去数
  deltaRate: number;            // 処理数の時間変化率 (%)
  latency: {
    value: number;              // 遅延時間 (単位: ms)
    source: "SIMULATION" | "EVENT_TIMESTAMP"; // 計測のデータソース区分
  };
  bufferSize: number;           // 現在のバッファ利用・格納率 (0–100 のパーセンテージ)
  status: "HEALTHY" | "ATTENTION" | "CONGESTED"; // 静的な数値分類に基づく状態
}
```

---

## 2. 状態分類閾値ルール (Deterministic Classification Rules)

AIOS 自体が「障害判定・システムダウン診断」を行っているような過度な警告表現（NORMAL/WARNING/HIGH）を避けるため、状態の名称は単なる数値混雑度の分類である `HEALTHY`, `ATTENTION`, `CONGESTED` に制限する。

### [A] Latency (処理遅延) 分類
* **`HEALTHY`**: 0ms ≦ `value` ≦ 100ms （軽快なフロー状態）
* **`ATTENTION`**: 100ms ＜ `value` ≦ 500ms （注意を要する負荷状態）
* **`CONGESTED`**: 500ms ＜ `value` （数値上の渋滞・混雑状態）

### [B] Buffer (バッファ占有率) 分類
* **`HEALTHY`**: 0% ≦ `bufferSize` ≦ 50% （十分な空き容量）
* **`ATTENTION`**: 50% ＜ `bufferSize` ≦ 80% （メモリ/バッファ空き容量縮小）
* **`CONGESTED`**: 80% ＜ `bufferSize` （高占有による数値上の混雑状態）

### [C] 総合 Status 算出ルール
各レイヤーの `status` 値は、`latency.value` から判定した一時ステータスと、`bufferSize` から判定した一時ステータスのうち、**最も優先度の高いもの（CONGESTED ＞ ATTENTION ＞ HEALTHY）** を自動的・決定論的に採用する。
※ AIによる動的リスク診断や、Incident判定などのテキストメッセージの動的生成は一切行ってはならない。

---

## 3. UI 適合デザイン要件
* **PC Executive Flow Graph**:
  各ノードの直下に `[件数] processed | Latency [X]ms (SIMULATION) | Buffer [Y]%` を微発光の控えめなフォントで配置。
* **PC Pipeline State Card**:
  水平方向の進捗ゲージを用いてバッファサイズを表現し、右端に `HEALTHY` (緑), `ATTENTION` (黄), `CONGESTED` (紫/赤) のバッジをインライン表示。
* **Mobile View**:
  スマートフォンの限られた描画幅を考慮し、主要な3層（Timeline, Knowledge, Memory）のみのレイテンシと状態マークをコンパクトな縦スクロールリストで描画する。
