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

### 現在のスプリント: AIOS Kernel Local Simulation Tests Integration Foundation [現在のフェーズ]
* **目的**: 完成済みのローカルシミュレーションテスト環境を Git コミット操作（pre-commit）およびデプロイ操作（pre-deploy/clasp push）へ結合するため、品質ゲート検証フックスクリプト（`pre-commit-simulation.sh`, `pre-deploy-simulation.sh`）およびフック実行制御ランタイム（`hook_runner.js`）を `tools/hooks/` に新規実装・構築し、関連する仕様書の策定・更新を行う。
* **今回実装するもの (対象)**:
  - ✅ 新規仕様定義 (TestIntegration, CommitQualityGate, DeployQualityGate, HookExecutionAudit)
  - ✅ Git コミットフックスクリプトの実装 (`pre-commit-simulation.sh`)
  - ✅ claspデプロイフックスクリプトの実装 (`pre-deploy-simulation.sh`)
  - ✅ フック制御ランタイムの実装 (`hook_runner.js`): Hook/Run ID を管理し Quality Gate 判定に基づき Exit コード（Allow/Block）を制御
  - ✅ 既存テストランナー・レポーターのフック Run Context 対応 (`SimulationTestRunner.js`, `TestReporter.js`)
  - ✅ フック監査イベント（HookTriggered, HookCompleted）の追記のみ（Append-Only）保存の実装 (`AuditWriter.js`)
  - ✅ CLIおよびダッシュボードにおけるフックコマンド・フック状況表示の追加
* **今回実装しないもの (対象外)**:
  - ❌ フック失敗（Exit Code != 0）時にそれを無視して強制合格させる bypass オプションの導入
  - ❌ テスト結果データの改ざんや、不合格を隠蔽するフラグの追加
  - ❌ 監査ログファイル（`simulation_audit.log`）の上書き（Update）や消去（Delete）処理の実装

### 次期フェーズ: AIOS ローカルシミュレーションテスト統合 実装・適用 (AIOS Kernel Local Simulation Tests Integration Implementation)
* **目的**: フックの実働試験、およびデプロイ境界自動アサーションの機能拡充と、本番自動化テスト環境での継続的デリバリー検証。

### 将来フェーズ: ダッシュボード開発ロードマップ (Dashboard Development Sequence)
* **目的**: 実際のGAS API接続を行わず、モックデータのみを用いてDashboard of 全体レイアウト、UIデザイン、アニメーション、および操作性のモックを完成させる。
* **要件**: モックデータは、将来の実データ接続時に容易にJSON差し替えが行えるよう、**データ構造とUI描画ロジックを完全に分離（疎結合）**して設計する。

#### 開発手順 (Implementation Order)
1. **骨格 (Skeleton)**  
   * 完成条件: Header, Sidebar, Main Grid, 100vhレイアウト, Glass Cards of 基礎構造の作成。中身は空で良く、余白・高さ・視線誘導のみをレビュー対象とする。
2. **アニメーションファースト (Motion First)**  
   * 完成条件: 画面読み込み時のFade, Slide, Glassトランジション、およびLIVEインジケーターのゆっくりとした呼吸アニメーション（Pulse）の実装。開いた瞬間の「気持ちよさ」を追求する。
3. **実績値表示 (KPI)**  
   * 完成条件: 活動人数、新規活動人数、保有枚数を表示。KPI更新時のRolling Number（ドラムロールエフェクト）の実装。
4. **活動推移グラフ (Activity Trend - 主役)**  
   * 完成条件: SVGによる折れ線グラフの描画。Hover時のガイドライン（Hover Line）、アクティブデータポイントの発光（Point Glow: `#EA5F08`）、およびGlass Tooltipの実装。
5. **リアルタイム活動ログ (Activity Log)**  
   * 完成条件: 時系列ログ表示。新着追加時に3秒間オレンジにGlow（発光）するエフェクト。
6. **投票率パネル (Turnout)**  
   * 完成条件: 市別投票率進捗バー of 静かで美しい表示。
7. **極限の微調整 (Polish)**  
   * 完成条件: 余白のミリピクセル調整、グラフ線の太さ、Tooltipの配置、Blur強度の磨き上げ。

* **開発モットー**:
  > **"Don't build a dashboard. Build the place people want to come back to every morning."**
  > (ダッシュボードを作るな。人々が毎朝戻ってきたくなる場所を作れ。)

### 将来フェーズ (Future Dashboard Phases)
* **フェーズ 2: UI Component化**: プロトタイプで作成した各パーツ（KPIカード、グラフ、サイドナビ等）を再利用可能な独立コンポーネントとして共通化・整理する。
* **フェーズ 3: GAS Connection (JSON取得)**: バックエンド（GAS）と通信させ、ダッシュボード用の集計JSONを取得可能にする。
* **フェーズ 4: リアルデータ反映 ＆ チューニング**: 完成したUIコンポーネントに実データを流し込み、アニメーションの滑らかさやパフォーマンスのチューニングを行う。

---

> [!IMPORTANT]
> **AIへの重要命令**:  
> ダッシュボード開発フェーズにおいては、実データ（GAS）への接続コードは一切実装しないこと。すべてモックデータを用いて開発し、デザインシステム（DESIGN_SYSTEM.md）に定義された「滑らかなアニメーション」や「Glass Tooltip」などのUX体験の完成に全力を注ぐこと。
