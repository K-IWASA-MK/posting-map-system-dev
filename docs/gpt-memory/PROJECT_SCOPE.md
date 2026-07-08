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

### 現在のスプリント: AIOS Dashboard Executive Demo Visualization Foundation [現在のフェーズ]
* **目的**: 8つのインテリジェンスレイヤーの内部データをマクロに集約し、経営・顧客向けに高度に要約された統合デモ画面（Executive View）を提供する。
* **今回実装するもの (対象)**:
  - ✅ 新規デモ仕様定義 (`DashboardExecutiveVisualization.md`)
  - ✅ Executive アダプター (`ExecutiveAdapter.js`): 各種データストアから Top KPI、フローグラフ状態、比率シェア、変化統計、ルール要約を計算する。
  - ✅ Executive UI コンポーネント: KPIパネル、フロー進行図、要約活動ストリーム、分布シェアメーター、メモリ容量概要カード。
  - ✅ 二画面共存ルーティング: URLパラメータ `?view=raw` と `?view=executive` による表示モードの安全な切り替え。
* **今回実装しないもの (対象外)**:
  - ❌ 操作用 UI (button, form, input, select) などの設置。AIによる動的な障害判定、原因診断、および「対応してください」のようなリスク推奨メッセージの動的生成。

### 完了したスプリント: AIOS Dashboard Demo Visualization Foundation
* **目的**: 構築された AIOS Event Intelligence Pipeline (Event ➔ Timeline ➔ Correlation ➔ Graph ➔ Knowledge ➔ Insight ➔ Evolution ➔ Pattern ➔ Memory) 全体の価値を可視化する統合デモ画面を構築する。
* **完了したスプリント2**: AIOS Dashboard Event Intelligence Memory Layer Foundation
* **完了したスプリント3**: AIOS Dashboard Event Intelligence Pattern Layer Foundation
* **完了したスプリント4**: AIOS Dashboard Event Insight Layer Foundation
* **完了したスプリント5**: AIOS Dashboard Event Knowledge Layer Foundation
* **完了したスプリント6**: AIOS Dashboard Event Intelligence Graph Foundation
* **完了したスプリント7**: AIOS Dashboard Event Correlation Intelligence Foundation
* **完了したスプリント8**: AIOS Dashboard Event Timeline Intelligence Foundation
* **完了したスプリント9**: AIOS Dashboard Event Intelligence & Attention Routing Foundation














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
