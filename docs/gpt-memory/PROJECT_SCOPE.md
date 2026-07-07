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

## 📍 3. Dashboard Development Sequence (Roadmap)

### Phase 1: Dashboard Prototype (モックデータ) [Current Phase]
* **目的**: 実際のGAS API接続を行わず、モックデータのみを用いてDashboardの全体レイアウト、UIデザイン、アニメーション、および操作性のモックを完成させる。
* **要件**: モックデータは、将来の実データ接続時に容易にJSON差し替えが行えるよう、**データ構造とUI描画ロジックを完全に分離（疎結合）**して設計する。

#### Sprint 1 開発手順 (Implementation Order)
1. **Sprint 1-1: Skeleton (骨格)**  
   * 完成条件: Header, Sidebar, Main Grid, 100vhレイアウト, Glass Cardsの基礎構造の作成。中身は空で良く、余白・高さ・視線誘導のみをレビュー対象とする。
2. **Sprint 1-2: Motion First (アニメーションファースト)**  
   * 完成条件: 画面読み込み時のFade, Slide, Glassトランジション、およびLIVEインジケーターのゆっくりとした呼吸アニメーション（Pulse）の実装。開いた瞬間の「気持ちよさ」を追求する。
3. **Sprint 1-3: KPI (実績値表示)**  
   * 完成条件: 活動人数、新規活動人数、保有枚数を表示。KPI更新時のRolling Number（ドラムロールエフェクト）の実装。
4. **Sprint 1-4: Activity Trend (活動推移グラフ - 主役)**  
   * 完成条件: SVGによる折れ線グラフの描画。Hover時のガイドライン（Hover Line）、アクティブデータポイントの発光（Point Glow: `#EA5F08`）、およびGlass Tooltipの実装。
5. **Sprint 1-5: Activity Log (リアルタイム活動ログ)**  
   * 完成条件: 時系列ログ表示。新着追加時に3秒間オレンジにGlow（発光）するエフェクト。
6. **Sprint 1-6: Turnout (投票率パネル)**  
   * 完成条件: 市別投票率進捗バーの静かで美しい表示。
7. **Sprint 1-7: Polish (極限の微調整)**  
   * 完成条件: 余白のミリピクセル調整、グラフ線の太さ、Tooltipの配置、Blur強度の磨き上げ。

* **開発モットー**:
  > **"Don't build a dashboard. Build the place people want to come back to every morning."**
  > (ダッシュボードを作るな。人々が毎朝戻ってきたくなる場所を作れ。)


### Phase 2: UI Component化
* **目的**: プロトタイプで作成した各パーツ（KPIカード、グラフ、サイドナビ等）を再利用可能な独立コンポーネントとして共通化・整理する。

### Phase 3: GAS Connection (JSON取得)
* **目的**: バックエンド（GAS）と通信させ、ダッシュボード用の集計JSONを取得可能にする。

### Phase 4: Real Data (リアルデータ反映 ＆ チューニング)
* **目的**: 完成したUIコンポーネントに実データを流し込み、アニメーションの滑らかさやパフォーマンスのチューニングを行う。

---

> [!IMPORTANT]
> **AI（Flash）への重要命令**:  
> Phase 1のフェーズにおいては、実データ（GAS）への接続コードは一切実装しないこと。すべてモックデータを用いて開発し、デザインシステム（DESIGN_SYSTEM.md）に定義された「滑らかなアニメーション」や「Glass Tooltip」などのUX体験の完成に全力を注ぐこと。

