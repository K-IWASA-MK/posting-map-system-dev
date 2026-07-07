# ダッシュボードコンポーネント設計仕様書 (Dashboard Component Architecture Specification)

## 概要 (Overview)
本仕様書は、AIOS Dashboard におけるビジュアルコンポーネント（Visual Component）の設計モデル、Props フロー、および境界定義を規定する。

---

## コンポーネントレイヤー構造 (Component Layer Architecture)
コンポーネントは純粋な「表示専用オブジェクト（View Components）」であり、以下の単一方向データフローを厳密に維持する。

```
[Dashboard.js (データロード & ライフサイクル制御)]
           │
           ▼
[DashboardRenderer.js (配置制御 & Props受渡し)]
           │
           ▼
[各 Visual Component (Props ──> HTML変換出力)]
           │
           ▼
[DOM Mount Points]
```

---

## コンポーネント境界ルール (Component Boundary & Reuse Rules)
1. **データ取得・ビジネスロジックの禁止**:
   - 各コンポーネント内での `fetch`, APIリクエスト, StripeやSpreadsheetAppへのアクセス、および状態計算ロジック（`calculateScore()`, `payment()`, `approve()`等）の実装は厳密に禁止する。
2. **Props 受信に特化**:
   - 各コンポーネントは、受け取った Props 引数（例: `label`, `value`, `status`）のみを参照して静的 HTML 文字列を返す静的関数モデルで実装される。
3. **再利用性の確保**:
   - `KPICard.js` などの共通の基礎部品を利用して、`KnowledgeCard` などのドメイン固有カードを表示することで、デザインシステムおよび UI パターンの重複を排除する。
