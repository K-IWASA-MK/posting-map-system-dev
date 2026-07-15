# Transformation OS: 02_Transformation_Language

## 1. 概念定義 (Concept Definition)
Transformation Language とは、Transformation OS を構成するすべての Engine, Runtime, Factory, そして Resource (AI / Human) が共有する「完全固定された語彙（Vocabulary）」である。
システム内において、同義語や類義語の解釈（推論）は一切許可されない。以下に定義された定数（Enum）のみが流通を許される。

## 2. エンティティの命名固定 (Entity Naming)
システム内に存在する主要な概念は以下の名称で完全に固定される。
* Goal
* Goal Definition
* Transformation Contract
* Execution Unit
* Evidence
* Outcome
* Value
* Ledger
* Task State
* Priority
* Constraint
* Requirement
* Capability
* Feature
* Risk
* Dependency
* Recovery

## 3. 状態の固定 (Task State Enum)
Task Lifecycle における状態は以下の8つのみに固定され、これ以外の状態（例: IN_PROGRESS, PENDING, CANCELLED 等）の使用を禁止する。
1. `CREATED`
2. `READY`
3. `RUNNING`
4. `WAITING`
5. `FAILED`
6. `RECOVERING`
7. `DONE`
8. `ARCHIVED`

## 4. イベントの固定 (Event Enum)
Automation Runtime（EventBus）を流れるイベントの種別は以下のみとする。
* `GOAL_DEFINED`
* `CONTRACT_CREATED`
* `TASK_CREATED`
* `TASK_DISPATCHED`
* `EXECUTION_STARTED`
* `EVIDENCE_CREATED`
* `CONTRACT_PASSED`
* `CONTRACT_FAILED`
* `RECOVERY_STARTED`
* `RECOVERY_FINISHED`
* `LEARNING_UPDATED`

## 5. Requirementの固定 (Requirement Type)
Transformation Contract において定義される要件の強度は以下のみとする。
* `REQUIRED` (必須)
* `OPTIONAL` (任意)
* `PROHIBITED` (禁止)

## 6. Evidenceの固定 (Evidence Type)
収集可能な Evidence の種類は以下に限定され、これら以外（例: AIの感想、人間の目視確認）は Evidence として扱われない。
* `TEST`
* `BUILD`
* `LINT`
* `STATIC_ANALYSIS`
* `SECURITY`
* `PERFORMANCE`
* `COVERAGE`

## 7. Recoveryの固定 (Recovery Action)
Diagnosis Engine が発行し、Recovery Engine が実行可能なアクションは以下のみとする。
* `RETRY` (再試行)
* `SPLIT` (分割)
* `MERGE` (統合)
* `REPLAN` (再計画)
* `RECONTRACT` (契約の修正)
* `ESCALATE` (Orchestratorへの引き上げ)
* `ABANDON` (破棄)

## 8. 辞書としての機能 (Mechanical Factory)
この Transformation Language が定義されることで、Task Factory は言葉の意味を「考える（推論する）」必要がなくなる。
例えば `if Requirement == REQUIRED_TEST ➔ Execution Unit(Test_Implementation)` のように、この共通辞書を読んで 1対1 でマップするだけの「決定論的な工場」として機能することが可能となる。

---
**※Transformation OS は Architecture Driven Development を採用する。Blueprint が100%承認されるまで、いかなる実装も開始してはならない。**
