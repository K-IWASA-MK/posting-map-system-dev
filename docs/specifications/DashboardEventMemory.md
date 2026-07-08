# Dashboard Event Memory Layer Specification (DashboardEventMemory.md)

## 1. メモリ層アーキテクチャ定義 (Event Memory Layer Architecture)
イベントメモリ層は、パターンおよびエボリューション履歴データを長期履歴スナップショット（Snapshot）として蓄積・構造化し、過去状態のアーカイブや時系列変化のアーカイブ参照を表示専用（Event Memory View）としてマッピングする Observer レイヤーである。
AI モデルによる学習・自己改善、予測、トラブル原因分析、および自動対応は一切排除し、完全に表示専用の長期履歴保存のみに制限する。

---

## 2. メモリ・ライフサイクルおよび保持ルール (Snapshot Retention Rule)
* **生成 (Creation)**:
  パターン層更新イベント（`event-pattern-update`）を受信した段階で、メモリビルダー（`DashboardMemoryBuilder`）がエボリューション履歴を含んだスナップショットを生成し、ストアへ保存する。
* **破棄 (Eviction)**:
  ストア（`DashboardEventMemoryStore`）の容量上限（最大 1000 件）に達した場合、最も古いメモリレコードから順に自動破棄（スライディングウィンドウ）し、メモリリークを防止する。

---

## 3. レンダリング・パイプライン
```
[Event Pattern Update] ➔ [Memory Builder] ➔ [Memory Store] ➔ [Memory Adapter] ➔ [EventMemoryCard Render]
```
メモリカードは完全に表示専用（Read Only Boundary）であり、ボタンや入力フォーム、アーカイブ操作（削除・編集など）の操作要素は一切配置しない。
