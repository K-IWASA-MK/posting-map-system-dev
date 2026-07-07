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

### 現在のスプリント: AIOS Dashboard Turnout Component Foundation [現在のフェーズ]
* **目的**: 投票率概要および市別投票率を表示する専用ビジュアルコンポーネント（`TurnoutCard.js`, `TurnoutProgressBar.js`）を設計・構築し、Props の受信による一元的なマウントおよびメーターのイージング拡張アニメーションを統合する。コンポーネント内からの通信や予測計算は 100% 排除し、Observer を堅持する。
* **今回実装するもの (対象)**:
  - ✅ 新規仕様定義 (TurnoutComponent, TurnoutCardSpecification, TurnoutDataSchema)
  - ✅ ビジュアルコンポーネント実装 (`src/dashboard/components/`): TurnoutCard (カードレイアウト), TurnoutProgressBar (進捗バーメーター)
  - ✅ レンダラー更新 (`DashboardRenderer.js`): 投票率の Props マッピング追加および一括 DOM 挿入
  - ✅ 状態表示 UI 統合 (`DashboardApp.html`): コンポーネント用スクリプトのインクルード
  - ✅ スタイル定義追加 (`Dashboard.css`): 進捗バー枠、プログレス塗りつぶし、およびイージングメーター、バッジ等の CSS
  - ✅ モーション同期更新 (`DashboardMotion.js`): 0% から受信値（目標幅）までのイージング width 拡張アニメーション
  - ✅ データアダプター更新 (`DashboardDataAdapter.js`): 投票率データの正規化（Normalize）およびデフォルトモック
  - ✅ 既存仕様（KernelDashboard.md, DashboardComponent.md, PROJECT_SCOPE.md, AGENTS.md）の対応追加
* **今回実装しないもの (対象外)**:
  - ❌ コンポーネント内部での勝敗予測、当落見込み、AI分析、および変動の集計ロジック
  - ❌ 操作をトリガーするボタン（Execute, Approve 等）の追加、通信メソッド（POST/PUT等）の参照

### 次期フェーズ: AIOS Dashboard Layout Polish & Detail adjustments
* **目的**: ダッシュボード全体の余余白（Padding / Margin）、フォントサイズ、および暗黒 UI 境界配色の極微細調整。

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
