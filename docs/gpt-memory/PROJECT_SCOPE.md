# Project Scope & Default Environment (SSOT)

## 📍 1. Current Default Tenant
- **Tenant ID**: `MIE-03`
- **Branch ID**: `MIE-03`
- **Branch Name**: `三重第3支部` (Display Name)
- **District**: `三重県 第3区`

## 📍 2. Tenant Abstraction Rules
- Always avoid hardcoding specific Tenant IDs (like `MIE-03` or `AICHI-05`) directly in application logic.
- Use the configuration layers (`CONFIG` object in frontend `config.js` and backend `v2_config.gs`) to lookup settings dynamically.
- The standard testing environment is default-mapped to `MIE-03`, but the system must be fully compatible with any generic tenant IDs (e.g. `AICHI-05`, `GIFU-02`, `SHIZUOKA-01`).

## 📍 3. AIOS 開発ロードマップ (Roadmap)

### 現在のスプリント: AIOS Dashboard Performance Optimization Foundation [現在のフェーズ]
* **目的**: 表示速度、描画効率、およびメモリ使用量の最適化。既存の Observer Architecture、EventBus、および Polling 制御を維持したままパフォーマンス向上。
* **今回実装するもの (対象)**:
  - ✅ 新規ビジュアル仕様定義 (DashboardPerformance.md, DashboardRenderingPipeline.md, DashboardMemoryManagement.md)
  - ✅ 差分描画機構の導入 (`DashboardRenderer.js`): `DashboardRenderCache` を介した変更コンポーネントのみの部分的マウント
  - ✅ Visibility API 連携 (`DashboardMotion.js` / `DashboardPollingController.js`): タブ非表示時のポーリング・アニメーション停止と復帰時の即時同期
  - ✅ 通信・イベント購読クリーンアップ (`DashboardEventBus.js` / `Dashboard.js`): unsubscribe, clearListeners, アンロードクリーンアップ
  - ✅ GPUアクセラレーションの最適化 (`Dashboard.css`): will-change, translateZ を特定のアニメーション要素のみに適用
  - ✅ 既存仕様（KernelDashboard.md, DashboardComponent.md, PROJECT_SCOPE.md, AGENTS.md）の対応追加
* **今回実装しないもの (対象外)**:
  - ❌ 操作UIの追加、データの書込み（Write）操作、API仕様の変更

### 完了したスプリント: AIOS Dashboard Accessibility & Responsive Optimization
* **目的**: 構築済みの Dashboard 各画面に対し、アクセシビリティ対応（スクリーンリーダー・prefers-reduced-motion）および複数デバイス表示（レスポンシブメディアクエリ）の最適化。
* **目的2**: 構築済みの各種カードやグラフ、投票率パネルの余白（Spacing）、角丸（Radius）、フォント階層（Typography Scale）の CSS Token 整理とガラスモーフィズム表現の洗練。



### 将来フェーズ: ダッシュボード開発ロードマップ (Dashboard Development Sequence)
* **目的**: モックデータを用いてDashboardのアニメーション、および操作性のモックを完成させる。
* **要件**: モックデータは、将来の実データ接続時に容易にJSON差し替えが行えるよう、**データ構造とUI描画ロジックを完全に分離（疎結合）**して設計する。

#### 開発手順 (Implementation Order)
1. **骨格 (Skeleton)**  
   * ✅ 完成条件: Header, Sidebar, Main Grid, 100vhレイアウト, Glass Cards of 基礎構造の作成。中身は空で良く、余白・高さ・視線誘導のみをレビュー対象とする。
2. **アニメーションファースト (Motion First)**  
   * ✅ 完成条件: 画面読み込み時のFade, Slide, Glassトランジション、およびLIVEインジケーターのゆっくりとした呼吸アニメーション（Pulse）の実装。開いた瞬間の「気持ちよさ」を追求する。
3. **実績値表示 (KPI)**  
   * ✅ 完成条件: 活動人数、新規活動人数、保有枚数を表示。KPI更新時のRolling Number（ドラムロールエフェクト）の実装。
4. **活動推移グラフ (Activity Trend - 主役)**  
   * ✅ 完成条件: SVGによる折れ線グラフの描画。Hover時のガイドライン（Hover Line）、アクティブデータポイントの発光（Point Glow: `#EA5F08`）、およびGlass Tooltipの実装。
5. **リアルタイム活動ログ (Activity Log)**  
   * ✅ 完成条件: 時系列ログ表示。新着追加時に3秒間オレンジにGlow（発光）するエフェクト。
6. **投票率パネル (Turnout)**  
   * ✅ 完成条件: 市別投票率進捗バー of 静かで美しい表示。
7. **極限の微調整 (Polish)**  
   * 完成条件: 余白のミリピクセル調整、グラフ線の太さ、Tooltipの配置、Blur強度の磨き上げ。

* **開発モットー**:
  > **"Don't build a dashboard. Build the place people want to come back to every morning."**
  > (ダッシュボードを作るな。人々が毎朝戻ってきたくなる場所を作れ。)

---

> [!IMPORTANT]
> **AIへの重要命令**:  
> ダッシュボード開発フェーズにおいては、実データ（GAS）への接続コードは一切実装しないこと。すべてモックデータを用いて開発し、デザインシステム（DESIGN_SYSTEM.md）に定義された「滑らかなアニメーション」や「Glass Tooltip」などのUX体験の完成に全力を注ぐこと。
