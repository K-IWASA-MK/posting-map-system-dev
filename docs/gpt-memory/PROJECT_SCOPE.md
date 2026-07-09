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

### 現在のスプリント: AIOS Phase 201-4: Gemini Adapter Foundation [現在のフェーズ]
* **目的**: Phase 201-3 Claude Adapter Foundation を基盤とし、AIOS が利用する LLM Adapter の第二弾である Gemini Adapter Foundation（仕様・GeminiModelRegistry・GeminiProvider・GeminiModelStatus・インターフェース実装）を構築する。
* **今回実施するもの (対象)**:
  - Gemini Adapter 設計仕様書（`docs/specifications/DevelopmentGeminiAdapter.md`）の策定。
  - `src/aios/` への新規追加（GeminiAdapter, GeminiModelRegistry, GeminiAdapterFactory, GeminiAdapterValidator, GeminiAdapterAdapter）の実装。
  - `ToolRegistry.ts` の `tool-gemini` 定義追加。
  - `DevelopmentRules.ts` の Capability → Pipeline → Tool Adapter → GeminiAdapter → GeminiModelRegistry 解決（getGeminiAdapter, getGeminiModels）の実装。
  - テストおよびビルド検証。

### 完了したスプリント: AIOS Phase 201-3: Claude Adapter Foundation
* **目的**: Phase 201-2 Antigravity Adapter Foundation を基盤とし、AIOS が利用する LLM Adapter の第一弾である Claude Adapter Foundation（仕様・ClaudeModelRegistry・ClaudeProvider・ClaudeModelStatus・インターフェース実装）を構築する。
* **実施したもの**:
  - Claude Adapter 設計仕様書（`docs/specifications/DevelopmentClaudeAdapter.md`）の策定。
  - `src/aios/` への新規追加（ClaudeAdapter, ClaudeModelRegistry, ClaudeAdapterFactory, ClaudeAdapterValidator, ClaudeAdapterAdapter）の実装。
  - `ToolRegistry.ts` の `tool-claude` 定義追加。
  - `DevelopmentRules.ts` の Capability → Pipeline → Tool Adapter → ClaudeAdapter → ClaudeModelRegistry 解決（getClaudeAdapter, getClaudeModels）の実装。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 201-2: Antigravity Adapter Foundation
* **目的**: Phase 201-1 Tool Adapter Foundation を基盤とし、AIOS が最初に接続する具象 Adapter である Antigravity Adapter Foundation（仕様・CommandRegistry・CommandCategory・抽象IDマッピング・インターフェース実装）を構築する。
* **実施したもの**:
  - Antigravity Adapter 設計仕様書（`docs/specifications/DevelopmentAntigravityAdapter.md`）の策定。
  - `src/aios/` への新規追加（AntigravityAdapter, AntigravityCommandRegistry, AntigravityAdapterFactory, AntigravityAdapterValidator, AntigravityAdapterAdapter）の実装。
  - `ToolRegistry.ts` の `tool-antigravity` 定義追加。
  - `DevelopmentRules.ts` の Capability → Pipeline → Tool Adapter → AntigravityAdapter 解決（getAntigravityAdapter）の実装。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 201-1: Tool Adapter Foundation
* **目的**: Phase 200 で完成した Development OS Foundation を基盤として、Development OS と外部開発環境を完全分離する Tool Adapter Foundation（定義・登録・解決・簡素依存・ToolCategory・AdapterStatus・対称構造）を構築する。
* **実施したもの**:
  - Tool Adapter 設計仕様書（`docs/specifications/DevelopmentToolAdapter.md`）の策定。
  - `src/aios/` への新規追加（ToolRegistry, ToolFactory, ToolValidator, ToolAdapter, ToolAdapterFactory, ToolAdapterValidator, ToolAdapterAdapter）の実装。
  - `DevelopmentRules.ts` の Capability → Pipeline → Tool Adapter 解決（getToolAdapters）の実装。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 200-7: Development Quality Gate Foundation
* **目的**: Phase 200-6 Development Execution Ledger Foundation を基盤とし、Development OS 全体の品質判定ゲートとなる Development Quality Gate Foundation（定義・状態遷移・評価集計・Ruleバージョン・対称構造）を構築する。
* **実施したもの**:
  - Quality Gate 設計仕様書（`docs/specifications/DevelopmentQualityGate.md`）の策定。
  - `src/aios/` への新規追加（QualityGateRegistry, QualityGateFactory, QualityGateValidator, QualityGateAdapter）の実装。
  - `DevelopmentRules.ts` の Capability → Pipeline → Ledger → Quality Gate 解決（getQualityGate）の実装。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 200-6: Development Execution Ledger Foundation
* **目的**: Phase 200-5 Development Skill Pipeline Foundation を基盤とし、Development OS 全体の不変な監査台帳となる Development Execution Ledger Foundation（定義・検証・型安全・対称構造・状態遷移・監査イベント）を構築する。
* **実施したもの**:
  - Execution Ledger 設計仕様書（`docs/specifications/DevelopmentExecutionLedger.md`）の策定。
  - `src/aios/` への新規追加（ExecutionLedgerRegistry, ExecutionLedgerFactory, ExecutionLedgerValidator, ExecutionLedgerAdapter）の実装。
  - `DevelopmentRules.ts` の Capability → Pipeline → Ledger 解決（getExecutionLedger）の実装。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 200-5: Development Skill Pipeline Foundation
* **目的**: Phase 200-4 Development Skill Registry Foundation を基盤とし、Development OS 全体で利用する Development Skill Pipeline Foundation（定義・順序・検証・型安全・対称構造・順序バリデーション）を構築する。
* **実施したもの**:
  - Skill Pipeline 設計仕様書（`docs/specifications/DevelopmentSkillPipeline.md`）の策定。
  - `src/aios/` への新規追加（SkillPipelineRegistry, SkillPipelineFactory, SkillPipelineValidator, SkillPipelineAdapter）の実装。
  - `DevelopmentRules.ts` の Capability → Pipeline 解決（getRequiredPipeline）の実装。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 200-4: Development Skill Registry Foundation
* **目的**: Phase 200-3 Development Capability Registry Foundation を基盤とし、Development OS 全体で利用する Development Skill Registry Foundation（定義・登録・検証・型安全・静的マッピング）を構築する。
* **実施したもの**:
  - Skill Registry 設計仕様書（`docs/specifications/DevelopmentSkillRegistry.md`）の策定。
  - `src/aios/` への新規追加（SkillRegistry, SkillFactory, SkillValidator, SkillAdapter）の実装。
  - `CapabilityRegistry.ts` の `Capability` インターフェース更新（supportedSkillIds の追加）およびマッピングヘルパーの実装。
  - `DevelopmentRules.ts` の Skill Registry 逆引き参照対応。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 200-3: Development Capability Registry Foundation
* **目的**: Phase 200-2 Development OS Foundation を基盤とし、Development OS 全体で利用する Capability Registry Foundation（管理・定義・検証・型安全の確保）を構築する。
* **実施したもの**:
  - Capability Registry 設計仕様書（`docs/specifications/DevelopmentCapabilityRegistry.md`）の策定。
  - `src/aios/` への新規追加（CapabilityRegistry, CapabilityFactory, CapabilityValidator, CapabilityAdapter）の実装。
  - 既存モジュール（DevelopmentRules, CapabilityResolver）のレジストリ参照型へのリファクタリング。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 200-2: Development OS Foundation
* **目的**: Phase 200-1 にて策定した AIOS Architecture Charter を基盤とし、AIOS v1.1 の新OSレイヤーである Development OS の Foundation（不変データモデル・型定義・レジストリ）を構築する。
* **実施したもの**:
  - Development OS 設計仕様書（`docs/specifications/DevelopmentOS.md`）の策定。
  - `src/aios/` 以下の 7 モジュール（DevelopmentMode, DevelopmentRules, CapabilityResolver, SkillRegistry, SkillPipeline, ExecutionLedger, QualityGate）の実装。
  - テストおよびビルド検証。


### 完了したスプリント: AIOS Phase 200-1: AIOS Architecture Charter Foundation
* **目的**: AIOS v1.1 Development OS の開始にあたり、AIOS全体を統括する最高設計原則 AIOS Architecture Charter を策定する。
* **実施したもの**:
  - 最高位アーキテクチャ憲章（`docs/architecture/AIOS_ARCHITECTURE_CHARTER.md`）の新規策定。
  - ADR（Architecture Decision Record）規則および拡張原則（Extension Principle）の明文化。
  - 各種ドキュメントとロードマップの更新。


### 完了したスプリント: AIOS Dashboard v1.0 Release
* **目的**: Phase 173 で監査対応・品質改善を終えた Dashboard Stack を、正式版 v1.0.0 としてリリースする。
* **実施したもの**:
  - 最終リリース成果物の確認
  - Git Tag `AIOS-Dashboard-v1.0.0` の作成・反映
  - HANDOVER.md / PROJECT_SCOPE.md のリリース記録更新


### 完了したスプリント: AIOS Phase 173: Dashboard Architecture Audit Fixes
* **目的**: v1.0 正式リリース前品質監査の指摘（MAJOR 5件、MINOR 3件、SUGGESTION 2件）をすべて修正・反映し、決定論性・不変化・レスポンシブ動作を正常化する。

### 完了したスプリント: AIOS Phase 172: Dashboard Runtime Foundation
* **目的**: Phase 171 を基盤として、AIOS Dashboard 全体の起動・初期化・ライフサイクルを決定論的に一元管理する Runtime Framework を構築する。
### 完了したスプリント: AIOS Phase 171: Dashboard Rendering Pipeline Foundation
* **目的**: Phase 170 を基盤として、Dashboard 全体の描画順序・描画コンテキスト・描画ライフサイクルを決定論的に一元管理する Rendering Pipeline を構築する。

### 完了したスプリント: AIOS Phase 170: Dashboard Navigation Foundation
* **目的**: Phase 169 を基盤として、Dashboard 全体の画面遷移・ナビゲーションを統一管理する Navigation Framework を構築する。

### 完了したスプリント: AIOS Phase 169: Dashboard State Manager Foundation
* **目的**: Phase 168 を基盤として、Dashboard 全体の状態（Workspace、Layout、Widget、View等）を一元的に決定論的・不変管理する State Manager Framework を構築する。

### 完了したスプリント: AIOS Phase 168: Dashboard Workspace Foundation
* **目的**: Phase 167 を基盤として、Dashboard を用途ごとの Workspace 単位で構成・管理する Workspace Framework を構築する。

### 完了したスプリント: AIOS Phase 167: Dashboard Layout Engine Foundation
* **目的**: Phase 166 を基盤として、Dashboard 上の Widget 配置・グリッド構造・レスポンシブブレイクポイントを決定論的に管理するレイアウトエンジン共通基盤を構築する。

### 完了したスプリント: AIOS Phase 166: Dashboard Widget Foundation
* **目的**: Dashboard Widget の共通基盤（生成・登録・状態管理・ViewModel変換）を構築し、今後のレイアウトや状態管理の土台を整える。

### 完了したスプリント: AIOS Phase 164: Field Intelligence Audit Foundation

### 完了したスプリント: AIOS Phase 162: Field Intelligence History Foundation
* **目的**: 現場活動履歴の長期蓄積・証跡化。

### 完了したスプリント: AIOS Phase 161: Field Intelligence Analytics Foundation
* **目的**: 現場活動の履歴・推移・比較を可視化する Analytics Foundation の構築。

### 完了したスプリント: AIOS Phase 160: Field Operations View Foundation
* **目的**: 現場インテリジェンスを観測する Field Operations View Foundation の構築。

### 完了したスプリント: AIOS Phase 159: Tenant Intelligence Drilldown Foundation
* **目的**: 階層モデルをドリルダウン・段階追跡する Tenant Intelligence Drilldown Foundation の構築。

### 完了したスプリント: AIOS Phase 158: Multi-Tenant Executive Aggregation View Foundation
* **目的**: 複数テナントの状態を横断的に集計・観測する Executive Overview Foundation の構築。

### 完了したスプリント: AIOS Phase 157: Multi-Tenant Separation View Foundation
* **目的**: 複数テナントのデータ境界を安全に観測・可視化できる Multi-Tenant Separation View Foundation の構築。

### 完了したスプリント: AIOS Phase 156: Tenant Hierarchy Foundation
* **目的**: 将来のマルチテナント化を見据え、データ境界（tenantId）に基づいた汎用3階層モデルの構築。

### 完了したスプリント: AIOS Phase 155: POSTING MAP Field Operations Bridge Foundation
* **目的**: POSTING MAP の現場活動データを AIOS Pipeline へ安全に供給するための Field Intelligence Bridge Foundation を構築する。
* **完了したスプリント2**: AIOS Phase 154: Trust Governance View Foundation
* **目的**: 既存データパイプラインおよびコンテキストの信頼性状態を客観的監査ログとスコアによって表示する Trust Governance View を追加する。
* **完了したスプリント2**: AIOS Phase 153: Tenant Context Foundation
* **目的**: 将来のマルチテナント化（複数支部・複数組織展開）を見据え、現在アクティブなテナント情報を管理・提示する Tenant Context Foundation を導入する。
* **完了したスプリント2**: AIOS Phase 152: Executive Pipeline Health Visualization Foundation
* **目的**: 既存のデータフロー（Event ➔ Memory）における処理流量、レイテンシ、およびバッファ占有率の状態を可視化する Pipeline Health Visualization Foundation を構築する。
* **完了したスプリント2**: AIOS Phase 151: Executive KPI Temporal Intelligence Foundation
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
