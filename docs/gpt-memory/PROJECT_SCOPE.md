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

### 現在のスプリント: AIOS Phase 152: Executive Pipeline Health Visualization Foundation [現在のフェーズ]
* **目的**: 既存のデータフロー（Event ➔ Memory）における処理流量、レイテンシ、およびバッファ占有率の状態を可視化する Pipeline Health Visualization Foundation を構築する。
* **今回実装するもの (対象)**:
  - 新規パイプライン仕様定義 (`PipelineHealthVisualization.md`)
  - Pipeline Health Adapter の導入: `PipelineHealthAdapter.js` 内に不変な Pipeline Health Metric オブジェクト配列を算出する処理を実装。
  - UIコンポーネント強化: Flow Graph 内での処理件数・latency（source 属性付き）・buffer% の表示。
  - PC版 `PipelineHealthCard` およびモバイル用 `MobileFlowCard` の Pipeline State 簡易表示の統合。
* **今回実装しないもの (対象外)**:
  - ❌ AIを用いた主観的なシステム障害診断、Incident自動判定、自動復旧アクションの実行。操作用 UI (button/select等) や Write 通信 (POST/DELETE等) の追加。

### 完了したスプリント: AIOS Phase 151: Executive KPI Temporal Intelligence Foundation
* **目的**: 既存の Executive View および Mobile Executive View に時間比較軸を追加し、現在値の単一表示から「増減率、トレンド、静的ステータスラベル」の可視化へと進化させる。
* **完了したスプリント2**: AIOS Dashboard Mobile Executive View Foundation
* **目的**: 既存の Executive View を基盤とし、スマートフォンの狭い画面幅および片手操作に最適化した、監視専用の「Mobile Executive View」を構築する。
* **完了したスプリント2**: AIOS Dashboard Executive Demo Visualization Foundation
* **完了したスプリント3**: AIOS Dashboard Demo Visualization Foundation
* **完了したスプリント4**: AIOS Dashboard Event Intelligence Memory Layer Foundation
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
