# ログ自動スクロール・Glow仕様書 (Activity Log Auto Scroll & Glow Specification)

## 概要 (Overview)
本仕様書は、ポーリング更新によって新たな活動ログが追加された際の、新着検知・差分追加・スクロール制御および Glow アニメーションのライフサイクル管理を規定する。

---

## 差分追加とアニメーションフロー (Dynamic Mount & Scroll Flow)
新たなログが検出された際、ログコンテナの全体を再描画するのではなく、差分要素（`<li>`）をリスト先頭に挿入（Prepend）し、同時にスクロールと Glow アニメーションをトリガーする。

```
[新着ログを検出]
       │
       ▼ (Prepend: リスト先頭へ <li> 挿入)
[DOM マウント (opacity: 0)]
       │
       ▼ (reflow トリガー ──> .motion-active アタッチ)
[フェードイン & オレンジ Glow 表示開始]
       │
       ▼ (smooth scroll 実行: scrollTop を 0 へアニメーション)
[スクロール追従演出 (最上部へ引き戻す)]
       │
       ▼ (3000ms 経過後)
[Glow 自動消灯 (クラスの除去)]
```

---

## 各種パラメータ要件 (Animation Parameters)
- **スクロール形式 (Smooth Scroll)**:
  - リストコンテナ (`.log-container`) に対して、`scrollTop = 0` へのスクロール遷移を `behavior: 'smooth'` もしくは滑らかな JS 制御で行う。
- **Glow ライフサイクル (Glow Lifecycle)**:
  - 新着要素に付与された `.new-log-glow` クラスは、マウント後 `3000ms`（3秒間）にわたって維持された後、クラスを除去して周囲のリストに馴染ませる。
- **操作排除**:
  - 本スクロール中にユーザーが手動でリストを操作するのを妨げるロック等は行わない（自然な追従のみ）。
