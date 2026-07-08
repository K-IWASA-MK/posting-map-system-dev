# Dashboard Event Timeline Specification (DashboardEventTimeline.md)

## 1. タイムライン・アーキテクチャ定義 (Timeline Architecture)
タイムラインは、発生した時系列イベントを静的に格納し、管理者がプロセスの推移を一目で把握できるように可視化する「Event Timeline Observer Layer」である。
データの加工・予測・逆方向コマンド送信は一切含まず、純粋な一方向の時系列データレンダリングのみを行う。

---

## 2. イベントライフサイクル (Event Lifecycle Flow)
発生した生イベントは以下のフローで順次処理され、最終的な視覚的 UI に落とし込まれる。
```
[生イベント発生]
       │
       ▼
[Realtime Adapter] (検証、重複排除、重要度判定)
       │
       ▼
[Timeline Store] (時系列ソート、最大 500 件スライディングウィンドウ)
       │
       ▼
[Timeline Component] (Props マッピング ➔ HTML 生成)
       │
       ▼
[Visual Rendering] (フェードイン演出、マーカー Glow、縦結合ライン描画)
```

---

## 3. 時系列保持ルールと表示境界
- **完全時系列降順の順守**: 新規イベントが発生するたびに、タイムスタンプを基に厳密な降順（最新のものが最上位）にソートして保持・表示する。
- **Observer 境界の維持**: タイムラインは純粋な観測器（Observer）であり、ユーザーからのクリック等によるイベント承認（approve）やコマンド実行のトリガー、しきい値やポリシーの変更インターフェースは一切有しない。
