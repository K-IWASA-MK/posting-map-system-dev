# Implementation Plan - Phase131: Autonomous AI Planning Engine Foundation

## 1. Architecture Goal
AI Development Platform (AIOS) において、これまで構築された全レイヤー（ナレッジ・ポリシー・レビュー・スコープ・イベント・実行・スキーマ・グラフ）を基盤とし、AI が自律的に「実行計画（Plan）」を生成する中核レイヤー（Planning Layer）となる **Autonomous AI Planning Engine** の構造・型・契約（Blueprint）を定義します。
本フェーズでは、実際の計画生成アルゴリズム、AI推論・LLM呼び出しロジック、順序最適化エンジン、および意思決定ロジックは一切実装せず、スケルトンコードのみを定義します。

---

## 2. Design Principles
- **Blueprint Only**: 型、インターフェース、レジストリ、マネージャの構造定義に限定。
- **No Planning Algorithm**: 探索的あるいは推論的なプランニングアルゴリズムは実装しない。
- **No AI Reasoning / LLM Calls**: OpenAI/Gemini等のLLM/AIモデルの外部呼び出しは排除。
- **No Optimization Engine**: 計画のスケジューリング最適化などの複雑な計算処理は行わない。
- **Stateless Design**: プランニングエンジン自体は実行中の動的状態を保持しない。
- **Deterministic Plan Representation**: 同一のグラフおよびコンテキストから決定論的な計画表現を返すインターフェース設計。
- **Graph-Aware Planning Model**: Phase 130 で定義した System Execution Graph を入力として処理可能な構成。
- **Execution-Oriented Output Structure**: 生成された計画が直接タスクオーケストレーターに受け渡せるデータ構造。

---

## 3. Specification Document [NEW]
- `docs/specifications/AutonomousAIPlanningEngine.md`

---

## 4. TypeScript Blueprint
`src/planning/` ディレクトリ配下に以下の構造定義ファイルを作成します。

1. **`PlanningStatus.ts`**
   - 列挙型: `DRAFT`, `ANALYZING`, `GENERATED`, `VALIDATED`, `REJECTED`, `ARCHIVED`
2. **`PlanningType.ts`**
   - 列挙型: `SYSTEM`, `EXECUTION`, `OPTIMIZATION`, `REVIEW`, `GOVERNANCE`, `EVENT_DRIVEN`, `API_DRIVEN`
3. **`PlanStep.ts`**
   - インターフェース: `stepId`, `action`, `target`, `preconditions`, `postconditions`, `priority`
4. **`ExecutionPlan.ts`**
   - インターフェース: `planId`, `name`, `type`, `status`, `steps` (PlanStep[]), `dependencies` (Record<string, string[]>), `metadata`
5. **`PlanningContext.ts`**
   - インターフェース: `runtimeId`, `graphSnapshotId`, `eventTriggerId`, `governancePolicyId`, `executionHistoryRef`
6. **`AutonomousAIPlanningEngine.ts`**
   - インターフェース `IAutonomousAIPlanningEngine` (メソッド: `generatePlan()`, `validatePlan()`, `optimizePlan()`, `resolveDependencies()`)
   - 抽象クラス `BaseAutonomousAIPlanningEngine` (空実装)
7. **`PlanningRegistry.ts`**
   - クラス: `addPlan()`, `findPlan()`, `listPlans()`, `removePlan()` のシグネチャと空実装。
8. **`PlanningManager.ts`**
   - クラス: `initialize()`, `generate()`, `status()`, `shutdown()` のシグネチャと空実装。

---

## 5. Scope of Impact

### Allowed (変更許可)
- `docs/specifications/AutonomousAIPlanningEngine.md`
- `src/planning/*`
- `src/index.ts` (エクスポートの追加)

### Forbidden (変更禁止)
- 実際の計画実行エンジンの追加。
- LLM API呼び出しの実装。
- 順序最適化アルゴリズムの実体コードの記述。
- 外部データベース（永続化レイヤー）への保存処理の実装。

---

## 6. Verification Plan (検証計画)
1. **ビルド検証**: `npx tsc --noEmit` または `npm run build`
2. **CIE 健全性検証**: `python3 tools/cie.py verify` / `python3 tools/cie.py doctor`
3. **既存テスト**: `.venv/bin/pytest`

---

## 7. Definition of Done
* [ ] `docs/specifications/AutonomousAIPlanningEngine.md` の作成
* [ ] `src/planning/*` の各種ファイル作成
* [ ] `src/index.ts` へのエクスポート追加と更新
* [ ] TypeScript ビルドが正常に PASS
* [ ] `python3 tools/cie.py verify` が正常に PASS
* [ ] `python3 tools/cie.py doctor` が正常に PASS
* [ ] `.venv/bin/pytest` が正常に PASS
* [ ] `HANDOVER.md` の更新
* [ ] ローカル Git コミットの作成（メッセージ: `CIE Phase 131: Autonomous AI Planning Engine Foundation`）
