# Transformation OS: 01_CompanyArchitecture

## 1. 会社全体構成 (Company Overall Structure)
本システムは「AI開発会社」を超越した **「Transformation OS（変換OS）」** である。
唯一の商品は「GoalをValueへ変換する能力（Transformation）」であり、Taskはその内部実装に過ぎない。

```text
                Constitution
                      │
          Transformation Runtime
                      │
      ┌───────────────┴───────────────┐
      │                               │
 Task Factory                   Flow Controller
      │                               │
      └───────────Task OS─────────────┘
                      │
              Automation Runtime
                      │
────────────────────────────────────────────────
Contract Engine
Evidence Engine
Diagnosis Engine
Recovery Engine
────────────────────────────────────────────────
                      │
                Resource Pool
        (AI, Human, Tool, MCP, Database...)
                      │
                    Ledger
                      │
              Learning Runtime
                      │
                 Knowledge Base
                      │
                 Task Factory (Cycle)
```

## 2. コアコンポーネントの責務と境界

### 2.1 Transformation Runtime
* **責務**: 本システムの最上位実行環境。「Goal ➔ Value」への変換という絶対目的を司る。
* **境界**: 外界からの要求から最終価値提供まで全体。

### 2.2 Task Factory
* **責務**: Taskを生成する「入口」。Goalだけでなく、Recovery、Learning、CEO、Plugin などあらゆるソースから Execution Unit（Task）を生成する。
* **入力**: Goal, Recovery Plan, Learning Insight
* **出力**: Execution Unit

### 2.3 Flow Controller
* **責務**: 人やAIを管理するのではなく、システム全体の「流れ（Flow）」が憲法通りに進んでいるかをコントロールするオーケストレーター。

### 2.4 Task OS (Lifecycle Manager)
* **責務**: Taskの「Lifecycle（誕生から消滅まで）」を管理するカーネル。単なるフローではなく、状態の完全性を保証する。
* **状態**: `READY`, `RUNNING`, `FAILED`, `WAITING`, `RECOVERING`, `DONE`

### 2.5 Automation Runtime (仕事の神経)
* **責務**: 会社の神経系。Event, Queue, Priority, Timeout, Retry, Dead Letter, Scheduler, Dispatcher の全機能を内包し、一切の人手を介さずに脈動し続ける。

### 2.6 Engine Layer
* **Contract Engine**: Taskの完了条件（法律）を固定・判定する。
* **Evidence Engine**: 全リソースの出力から、検証可能な証拠を生成する。
* **Diagnosis Engine**: 症状（エラー等）から真因を特定する。
* **Recovery Engine**: Retry, Split, Merge, Escalation, Replan, Recontract を駆使し、停止したTaskを復旧させる。

### 2.7 Resource Pool (世界すべてのリソース)
* **責務**: Execution Unitを処理する計算・物理・概念的資源。
* **対象**: Claude, GPT, Gemini, Cursor, Antigravity IDE, Docker, GitHub Actions, Playwright, MCP, Human, API, Container, Database, Browser, Filesystem, GPU, Storage, Network。

### 2.8 Ledgers (記憶領域)
* **責務**: 会社の不変の記憶。`Evidence Ledger`, `Contract Ledger`, `Task Ledger`, `Execution Ledger`, `Learning Ledger` に分割される。

### 2.9 Learning Runtime & Knowledge Base
* **責務**: 最後ではなく「常に背後で走り続ける」バックグラウンドランタイム。LedgerからKnowledge Baseを構築し、Task Factoryへフィードバックすることで、無限のコスト削減と知能向上サイクルを回す。

---
**※本ArchitectureはBlueprintとして定義される。100%承認されるまで実装への移行は禁止する。**
