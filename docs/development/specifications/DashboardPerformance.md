# Dashboard Performance Specification (DashboardPerformance.md)

## 1. 目的と基本方針
本仕様は、AIOS Dashboard におけるリソース（CPU, GPU, メモリ, 通信）消費の最適化（Performance Optimization）方針を定義する。
ダッシュボード全体の応答性と省電力性を高め、長時間起動時（24時間連続稼働など）のメモリリークを完全に防止することを目的とする。

---

## 2. Rendering Pipeline 概要
描画の流れは以下の直列パイプラインに従い、各層は疎結合かつ単方向にデータを流す。
```
[API Endpoint]
      │ (GET fetch)
      ▼
[DashboardDataAdapter] (データ正規化・モック)
      │ (Normalized JS Object)
      ▼
[DashboardRenderer] (キャッシュ照合 ➔ 差分マウント)
      │ (Changed Components Only)
      ▼
[Component View] (DOM更新: innerHTML / outerHTML)
      │ (Reflow / Repaint Trigger)
      ▼
[DashboardMotion] (視覚アニメーション開始)
```

---

## 3. 初期ロードと DOM 更新削減方針 (Diff Rendering)
- **初回ロード (Initial Load)**:
  ダッシュボード起動時は、描画のチラつきを抑えるため、全グリッドの Skeleton を一括挿入して初期マウントする。
- **データ更新時 (Diff Updates)**:
  定期ポーリングや更新イベント受信時、全 DOM を破棄して再作成することは禁止する。`DashboardRenderCache` に記憶された前回の Props 情報と比較し、値に変更が生じたコンポーネントのみを抽出して、その対象カードの HTML のみをピンポイントで差し替える。

---

## 4. メモリ管理ルール (Memory Leak Protection)
- **Visibility API 連動**:
  ブラウザのタブが非アクティブ（バックグラウンド）になった際、不要な JavaScript タイマー、ポーリングリクエスト、および CSS/JS アニメーションを即座に一時停止する。
- **EventListener の解除**:
  EventBus の登録リスナーや DOM イベントハンドラは、不要になったタイミングまたはコンポーネント差し替え時に必ず購読解除（Unsubscribe）し、不要なクロージャ参照をメモリ上に残さない。

---

## 5. Performance Budget (パフォーマンス予算)
ダッシュボードが満たすべき処理速度予算を以下の通り定める。
- **初期描画時間 (Time to Interactive)**: ローカル環境にて `500ms` 以内。
- **ポーリング時のDOM更新負荷 (Update Script Time)**: 差分更新時 `16ms` (1フレーム) 以内。
- **メモリ使用量上限 (Heap memory limit)**: 長時間稼働時、増加し続けるリークがなく、基準値 `50MB` 以下を維持すること。
