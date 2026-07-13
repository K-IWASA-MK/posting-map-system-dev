# AIOS Dashboard Runtime Specification
# Version: 1.0 (Phase 172)

## 1. 目的 (Objective)
AIOS Dashboard v1.0 の最終的な起動ローダーとして、各種モジュール（Widget Registry, Layout Registry, Workspace Registry, State Manager, Navigation Manager, Rendering Pipeline）の起動、初期化の順序関係、およびランタイム全体の生存期間（Lifecycle）を決定論的に一元管理する **Dashboard Runtime Foundation** を定義する。
本仕様は、起動順序の安全性を保証し、起動完了（RUNNING）状態やモジュール初期化の整合性を監視・観測するための共通基盤である。

---

## 2. Runtime Context 定義 (Runtime Context Schema)

ランタイムコンテキスト（Runtime Context）は以下のプロパティを持ち、`Object.freeze()` によって厳格に不変化される。

```typescript
interface DashboardRuntimeContext {
  readonly runtimeId: string;            // ランタイム一意ID (例: "runtime-c3a9")
  readonly runtimeVersion: string;       // ランタイム仕様バージョン (例: "v1.0.0")
  readonly runtimeStatus: string;        // 起動状態 ("CREATED", "BOOTING", "INITIALIZING", "READY", "RUNNING")
  readonly initializedModules: string[]; // 初期化完了したモジュールIDのリスト
  readonly initializationOrder: string[];// 静的定義された順序関係リスト
  readonly bootTimestamp: string;        // 起動処理開始時刻タイムスタンプ
  readonly runtimeTimestamp: string;     // 現在時刻のタイムスタンプ
}
```

---

## 3. モジュール初期化順序 (Deterministic Boot Sequence)

ランタイムは、依存関係に基づいて以下の順序で各モジュールを決定論的に初期化する。

1. **DashboardWidgetRegistry**
2. **DashboardLayoutRegistry**
3. **DashboardWorkspaceRegistry**
4. **DashboardStateManager** (StateStore 初期化含む)
5. **DashboardNavigationManager** (ルーティングマッピング紐付け)
6. **DashboardRenderingPipeline** (コンテキスト検証、描画キュー生成)

起動中の状態遷移は以下のフェーズを厳格に順次たどる。

```
CREATED (ランタイム生成)
  ↓
BOOTING (ブート開始、モジュール初期化前)
  ↓
INITIALIZING (各モジュールを上記の順序に沿って初期化実行中)
  ↓
READY (全モジュールの初期化完了、稼働準備完了)
  ↓
RUNNING (ダッシュボード描画エンジン起動、実稼働中)
```

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本 Runtime 基盤およびテスト表示用状態カードは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - ランタイムの手動再起動、強制終了、自動復旧リトライコントロール等は一切配置しない。
- **文言制限**:
  - AI による「予測」「推薦」「最適化」「自己修復」「自動再起動」等のテキストや、これらを暗示するUI装飾は一切含めない。
