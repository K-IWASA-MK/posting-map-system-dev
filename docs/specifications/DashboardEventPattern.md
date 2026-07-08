# Dashboard Event Pattern Layer Specification (DashboardEventPattern.md)

## 1. パターン層アーキテクチャ定義 (Event Pattern Layer Architecture)
イベントパターン層は、構造変化差分（Event Evolution Layer）の履歴データを基盤とし、静的なイベントグルーピング・構造シグネチャによる分類結果と発生回数（Frequency）を表示専用ビュー（Event Pattern View）としてマッピングする Observer レイヤーである。
AI モデルによる将来の発生予測、機械学習、トラブル原因分析、および自動アクションは一切排除し、完全に表示専用のパターン集約のみに制限する。

---

## 2. パターン・ライフサイクル (Pattern Lifecycle)
* **生成 (Creation)**:
  エボリューション更新イベント（`event-evolution-update`）を受信した段階で、パターンビルダー（`DashboardPatternBuilder`）が静的グルーピング・シグネチャ合成処理を実行し、新規パターンオブジェクト（`Pattern Object`）を生成・更新する。
* **破棄 (Eviction)**:
  ストア（`DashboardEventPatternStore`）の容量上限（最大 300 件）に達した場合、最も古いパターンから順に自動破棄（スライディングウィンドウ）し、メモリリークを防止する。

---

## 3. レンダリング・パイプライン
```
[Event Evolution Update] ➔ [Pattern Builder] ➔ [Pattern Store] ➔ [Pattern Adapter] ➔ [EventPatternCard Render]
```
パターンカードは完全に表示専用（Read Only Boundary）であり、ボタンや入力フォーム、コマンドの逆方向送信などの操作は一切配置しない。
