# Dashboard Event Correlation Specification (DashboardEventCorrelation.md)

## 1. コレレーション・アーキテクチャ定義 (Correlation Architecture)
イベントコレレーション層は、蓄積された複数の個別イベントから「時間的な連続性」や「共通属性」を基に関係チェーン（Correlation Chain）を抽出し、管理者が時系列の文脈を把握できるように可視化する Observer レイヤーである。
AI による因果推論（Causation）やトラブルの原因分析、異常予測は一切排除し、完全に客観的な関係性の整理のみに限定する。

---

## 2. イベント関連付けモデル (Event Relationship Model)
コレレーション処理は、以下の 3 つの関係性（Relation Type）のみに基づいてイベントを結合する。

* **TEMPORAL_SEQUENCE**: 発生時間の近接性に基づき、時系列順にノードを接続（例: Event A ➔ Event B ➔ Event C）。
* **CATEGORY_GROUP**: 同一カテゴリ（`runtime`, `governance`, `quality`, `simulation`, `trust`）に属するイベント群を同一グループとして接続。
* **SOURCE_GROUP**: 同一の発行元（`Kernel`, `QualityGate` 等）から発生したイベント群を接続。

* **警告**: 上記以外の「因果関係（CAUSAL_RELATION）」などの関係種別を追加、または推論することは一切禁止する。

---

## 3. イベントフロー定義
```
[Event Created] ➔ [Received] ➔ [Timeline Stored] ➔ [Correlation Mapping] ➔ [Visual Graph]
```
生イベント受信後、タイムラインストアに格納された段階で関係ビルダーが駆動し、相関ストアを経由してグラフ描画へ送られる。
タイムラインと同様、完全な Read-Only 表示であり、コマンド送信等の逆方向の操作（Action）は行わない。
