# AIOS Dashboard Rendering Pipeline Specification
# Version: 1.0 (Phase 171)

## 1. 目的 (Objective)
AIOS Dashboard v1.0 の構築に向け、ダッシュボード全体の描画順序、描画コンテキスト、描画ライフサイクルを一元管理する **Dashboard Rendering Pipeline Foundation** を定義する。
本仕様は、状態、レイアウト、ワークスペース、ナビゲーションの各定義を決定論的にマージし、不変（Immutable）なレンダーコンテキストを構築したうえで、正確なウィジェット描画シーケンスを管理・実行する共通基盤である。

---

## 2. Render Context 定義 (Render Context Schema)

描画コンテキスト（Render Context）は以下の構造を持ち、`Object.freeze()` によって不変化される。

```typescript
interface DashboardRenderContext {
  readonly workspace: string;        // 描画対象のワークスペースID (例: "wsp-executive")
  readonly layout: string;           // 描画対象のレイアウトID (例: "lyt-exec-desktop")
  readonly navigation: string;       // 描画対象のナビゲーションID (例: "nav-executive")
  readonly state: object;            // 描画契機となった状態木スナップショット
  readonly widgets: string[];        // 描画対象のウィジェットIDリスト
  readonly viewport: string;         // レスポンシブ判定ブレイクポイント (例: "desktop")
  
  // 状態追跡・バージョン・メタデータ
  readonly pipelineId: string;       // 実行パイプライン識別子 (例: "pipeline-exec")
  readonly pipelineVersion: string;  // パイプラインバージョン (例: "v1.0")

  readonly renderStatus: string;     // 描画ステータス (例: "INIT", "COMPLETED")
  readonly renderVersion: number;    // 描画バージョン (レンダリング実行ごとにカウントアップ)
  readonly timestamp: string;        // レンダリング実行時刻タイムスタンプ
}
```

---

## 3. レンダリングライフサイクル (Render Lifecycle)

パイプラインの実行は以下のフェーズを順次たどり、状態遷移を発生させる。

```
INIT (初期化)
  ↓
CONTEXT_ASSEMBLED (コンテキスト集約)
  ↓
VALIDATED (整合性検証)
  ↓
QUEUE_ORDERED (描画順キューソート)
  ↓
EXECUTING (描画実行中)
  ↓
COMPLETED (完了)
```

### 3.1 描画順キューの決定論的ソート (Queue Ordering Rule)
- 描画コンテキストに含まれる `widgets`（対象ウィジェットIDリスト）を、各ウィジェット定義に設定されている `priority` の値（昇順）でソートし、描画キュー（Render Queue）を構成する。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本 Rendering Pipeline 基盤およびテスト表示用描画パイプラインカードは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - レンダリングの中断、再実行、レイアウト変更等の操作コントロールは一切配置しない。
- **文言制限**:
  - AI による「予測」「推薦」「最適化」「自動描画」「自動配置」等のテキストや、これらを暗示するUI装飾は一切含めない。
