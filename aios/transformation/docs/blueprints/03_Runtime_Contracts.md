# Transformation OS: 03_Runtime_Contracts

## 1. 概念定義 (Concept Definition)
Runtime Contracts とは、OS内部で稼働する各モジュール（Engine, Factory, Runtime）同士の「入出力、保証、失敗条件、発行イベント」を定めたシステム間の絶対契約である。
これはAPI仕様書のような実装詳細ではなく、「誰が何を責任として引き受け、何を確約するか」というOSレベルの約束事（Contract）である。以降の実装フェーズにおいて、この契約から逸脱した機能を各モジュールに持たせること（推測による機能追加等）は禁止される。

## 2. 各モジュールの Runtime Contract

### 2.1 Task Factory
* **Input**: Goal Definition, Transformation Contract
* **Output**: Execution Unit[]
* **Guarantee**: 生成された Execution Unit は、Contract Requirement と数学的に 1対1 で完全に対応していること。
* **Failure**: Contractの要件が不足している、または未策定の場合は生成を完全にブロックする。
* **Events**: `TASK_CREATED`

### 2.2 Automation Runtime
* **Input**: Execution Unit
* **Output**: Dispatch Event (Resource Pool への処理要求)
* **Guarantee**: 人手を介さず、指定されたイベントとキュー通りにタスクを流し切ること。
* **Failure**: `TIMEOUT`, `DEAD_LETTER`, `RETRY` (規定回数超過)
* **Events**: `TASK_DISPATCHED`, `EXECUTION_STARTED`

### 2.3 Evidence Engine
* **Input**: Raw Artifact / Raw Data (Resource Pool からの生出力)
* **Output**: Evidence Vector (検証可能な証拠)
* **Guarantee**: 生成される Evidence は必ず「再現可能（Reproducible）」であること。推論や曖昧なテキストを決して含んではならない。
* **Events**: `EVIDENCE_CREATED`

### 2.4 Contract Engine
* **Input**: Goal Definition (生成時), Evidence (判定時)
* **Output**: Transformation Contract, Validation Result (PASS / FAIL)
* **Guarantee**: 判定結果は決定論的であり、同一のEvidenceに対しては常に同一の結果を返すこと。
* **Events**: `CONTRACT_CREATED`, `CONTRACT_PASSED`, `CONTRACT_FAILED`

### 2.5 Diagnosis Engine
* **Input**: Evidence, Validation Result (FAIL), Ledger History
* **Output**: Diagnosis Report (症状と根本原因の特定)
* **Guarantee**: 単一のAIの推測で断定せず、複数のログ・履歴からの事実ベースで真因を特定すること。

### 2.6 Recovery Engine
* **Input**: Diagnosis Report
* **Output**: Recovery Plan (RETRY, SPLIT, MERGE, REPLAN, RECONTRACT, ESCALATE)
* **Events**: `RECOVERY_STARTED`, `RECOVERY_FINISHED`

### 2.7 Learning Runtime
* **Input**: Ledger (Execution, Task, Contract, Evidence の全履歴)
* **Output**: Knowledge Base Update (未来の処理最適化情報)
* **Guarantee**: 蓄積ではなく「システム全体の処理コストを将来的に下げること」にのみ寄与すること。
* **Events**: `LEARNING_UPDATED`

---
**※Transformation OS は Architecture Driven Development を採用する。Blueprint が100%承認されるまで、いかなる実装も開始してはならない。**
