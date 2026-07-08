# Executive KPI Temporal Specification (ExecutiveKPITemporal.md)

## 1. 目的と位置づけ
本仕様書は、AIOS Executive Dashboard にて表示される 4大 KPI に対して、「現在状態の報告」から「状態変化の傾向判定（時系列比較）」へ拡張するためのデータ構造、計算規則、および表示仕様を定義する。

---

## 2. Temporal Snapshot データ構造
時間変化を表現するため、現在値と比較元過去値の整合性を担保した、以下の Immutable（不変）な構造オブジェクトを定義する。オブジェクト生成時には必ず `Object.freeze()` を適用する。

```json
{
  "metricId": "activeEvents",
  "currentValue": 142,
  "previousValue": 120,
  "capturedAt": "2026-07-08T10:00:00.000Z",
  "previousCapturedAt": "2026-07-07T10:00:00.000Z",
  "delta": 22,
  "deltaRate": 18.3,
  "trendDirection": "UP",
  "statusLabel": "NORMAL"
}
```

### プロパティ定義
* `metricId`: 指標の ID キー (`activeEvents`、`knowledgeRecords`、`patternCount`、`memoryCapacity`)
* `currentValue`: 算出された現在の最新メトリクス値。
* `previousValue`: 比較対象となる直近過去ステップの値。
* `capturedAt`: 最新値の取得/算出日時（ISO-8601 形式）。
* `previousCapturedAt`: 過去値の取得/算出日時（ISO-8601 形式）。
* `delta`: 現在値と過去値の単純差分。
* `deltaRate`: 過去値を分母とする増減パーセンテージ。
* `trendDirection`: 増減傾向の静的シンボル (`UP` / `DOWN` / `STABLE`)。
* `statusLabel`: 静的に分類された重要度ラベル (`NORMAL` / `HIGH` / `SIGNIFICANT`)。

---

## 3. 計算規則とステータス分類 (決定論的静的ルール)
AIによる動的予測や自動診断は行わず、以下の決定論的ロジック（決定式）に従って算出する。

### 3.1. 増減およびパーセンテージ計算
$$delta = currentValue - previousValue$$
$$deltaRate = \begin{cases} 0 & (previousValue = 0) \\ \frac{delta}{previousValue} \times 100 & (previousValue \neq 0) \end{cases}$$

### 3.2. トレンド方向 (Trend Direction)
* `delta > 0` ➔ `UP`
* `delta < 0` ➔ `DOWN`
* `delta === 0` ➔ `STABLE`

### 3.3. ステータス分類基準 (Status Label)
増減率の絶対値 ($|deltaRate|$) に基づき、以下の通り静的に分類する。
* $0\% \le |deltaRate| \le 30\%$ ➔ `NORMAL`
* $30\% < |deltaRate| \le 70\%$ ➔ `HIGH`
* $|deltaRate| > 70\%$ ➔ `SIGNIFICANT`

---

## 4. ガバナンス制限 (ガードレール)
* **AI推論の排除**: トレンドやステータスラベルの決定にあたり、LLMやMLによる推測、診断、または推奨文（例:「注意してください」等の文言）を動的生成して表示することを厳禁とする。
* **完全 Read-Only の順守**: 時系列比較データを描画する KPI カード上に、手動更新やリセットを指示するためのボタンやリンク、入力フォーム等は一切設置しない。
* **メモリ・テナント接続性の担保**: 本構造は、将来的にテナント文脈（`tenantId`）の追加や、長期記憶層（`MemoryStore` / `MemoryLayer`）の Snapshot キャッシュ保存へと容易にマッピングが移行できるインターフェース設計とする。
