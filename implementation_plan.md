# Implementation Plan - Phase130: System-wide Execution Graph Engine

## 1. Architecture Goal
AI Development Platform (AIOS) において、これまで構築された全レイヤー（Knowledge, Governance, Review, Scope, Event, Execution, API Schema）を統合し、AIOS 全体を「単一のグラフ構造」として可視化・抽象化するための **Execution Graph Layer** の構造・契約定義（Blueprint）を構築します。
本フェーズでは、実際のグラフの探索、解析、順序最適化、可視化レンダリングなどの実行処理は行わず、グラフノードとエッジの関係を表現するデータモデルのみを定義します。

---

## 2. Design Principles
- **Blueprint Only**: 型、インターフェース、レジストリ、アナライザーの抽象シグネチャ定義に限定。
- **No Graph Execution / Traversal Engine**: 最短経路探索、DFS/BFS、トポロジカルソートなどの実行ロジックは実装しない。
- **No Optimization Logic**: グラフ簡素化やデッドコード削減などの最適化アルゴリズムは排除。
- **No Runtime Computation**: 動的なトポロジー計算や動的依存解決は行わない。
- **Stateless Graph Model**: グラフ定義自体は実行時の遷移状態を保持しない。
- **Deterministic Node/Edge Representation**: 同一のメタデータ入力から一意のノードおよびエッジオブジェクトを導出する。
- **Layer-Agnostic Design**: 特定の実行レイヤーに依存せず、すべてのサブシステムをグラフ要素として同等に扱える設計。
- **Future AI Planning Ready**: 将来の AI プランナーによるタスク生成や最適化のインプットとして利用可能なインターフェース。

---

## 3. Specification Document [NEW]
- `docs/specifications/SystemExecutionGraph.md`

---

## 4. TypeScript Blueprint
`src/graph/` ディレクトリ配下に以下の構造定義ファイルを作成します。

1. **`ExecutionGraphNodeType.ts`**
   - 列挙型: `KNOWLEDGE`, `GOVERNANCE`, `REVIEW`, `SCOPE`, `EVENT`, `EXECUTION`, `API_SCHEMA`, `SYSTEM`
2. **`ExecutionGraphNode.ts`**
   - インターフェース: `id`, `type`, `layer`, `metadata`, `references`
3. **`ExecutionGraphEdge.ts`**
   - インターフェース: `from`, `to`, `relationType`, `weight`, `metadata`
4. **`ExecutionGraphContext.ts`**
   - インターフェース: `graphId`, `runtimeId`, `phase`, `timestamp`, `scope`
5. **`ExecutionGraphEngine.ts`**
   - インターフェース `IExecutionGraphEngine` (メソッド: `buildGraph()`, `addNode()`, `addEdge()`, `resolveGraph()`)
   - 抽象クラス `BaseExecutionGraphEngine` (空実装)
6. **`ExecutionGraphRegistry.ts`**
   - クラス: `addNode()`, `addEdge()`, `removeNode()`, `findNode()`, `listGraph()` のシグネチャと空実装。
7. **`ExecutionGraphAnalyzer.ts`**
   - クラス: `analyzeDependencies()`, `detectCycles()`, `mapLayers()` のシグネチャと空実装。
8. **`ExecutionGraphManager.ts`**
   - クラス: `initialize()`, `build()`, `status()`, `shutdown()` のシグネチャと空実装。

---

## 5. Scope of Impact

### Allowed (変更許可)
- `docs/specifications/SystemExecutionGraph.md`
- `src/graph/*`
- `src/index.ts` (エクスポートの追加)

### Forbidden (変更禁止)
- Graph 探索ランタイムエンジンの実装（Dijkstra法、A*検索等の追加）。
- 外部のグラフデータベース（Neo4j 等）へのアダプター追加。
- グラフビジュアライゼーションライブラリ（D3.js, Cytoscape 等）の依存導入。
- AI プランニング、依存自動解決などの実際の実装。

---

## 6. Verification Plan (検証計画)
1. **ビルド検証**: `npx tsc --noEmit` または `npm run build`
2. **CIE 健全性検証**: `python3 tools/cie.py verify` / `python3 tools/cie.py doctor`
3. **既存テスト**: `.venv/bin/pytest`

---

## 7. Definition of Done
* [ ] `docs/specifications/SystemExecutionGraph.md` の作成
* [ ] `src/graph/*` の各種ファイル作成
* [ ] `src/index.ts` へのエクスポート追加と更新
* [ ] TypeScript ビルドが正常に PASS
* [ ] `python3 tools/cie.py verify` が正常に PASS
* [ ] `python3 tools/cie.py doctor` が正常に PASS
* [ ] `.venv/bin/pytest` が正常に PASS
* [ ] `HANDOVER.md` の更新
* [ ] ローカル Git コミットの作成（メッセージ: `CIE Phase 130: System-wide Execution Graph Engine Foundation`）
