# Dashboard Demo Visualization Specification (DashboardDemoVisualization.md)

## 1. ビジュアル表現とグリッドレイアウト (Demo Dashboard Layout)
デモ画面（AIOS Control Center）は、以下のグリッド構成に従って UI 要素を配置する。

* **全体構成**: 漆黒（#000000）の背景、高品位なガラスモーフィズム枠（blur(20px)）、微発光ブルーカーボンのシャドウ効果。
* **グリッドレイアウト**: 2 カラムグリッド構成（`grid-template-columns: 1fr 1fr`）により、パイプラインの 8 つの主要ブロックを均等配置する。
  1. Runtime Event Stream (左上)
  2. Event Timeline (右上)
  3. Event Correlation View (左中)
  4. Event Knowledge (右中)
  5. Insight View (左下)
  6. Evolution View (右下)
  7. Pattern View (左最下)
  8. Memory View (右最下)

---

## 2. 独立デモプロバイダー分離規則 (Separated Demo Generator)
- ダッシュボードの表示コンポーネント自身がダミーイベントを生成してはならない。
- 完全に隔離された `DemoEventGenerator` が一定時間ごとに EventBus に対し模擬的なリアルタイムイベントを配信し、ダッシュボードはこれを受信して流れるデータ（パイプライン）を Observer 表示するだけに制限する。
- 模擬イベント操作用ボタンや設定フォームなどの操作用 UI は一切配置しない。
