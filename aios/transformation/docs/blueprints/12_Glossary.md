# Transformation OS: 04_Glossary

Transformation OS で使用する公式用語を定義する。

## Architectural Terminology (構造用語)

* **Constitution (憲法)**
  本システムの最高法規。すべての設計、OS、Engine、ルールの最上位に位置する。

* **Transformation OS**
  「GoalをValueへ変換すること」そのものをOSとして構築した自律システム。旧称：AI Development Company。

* **Transformation Runtime**
  システムの最上位実行環境。このRuntimeの上でTask FactoryとTask OSが駆動する。

* **Task Factory**
  Goal、Recovery要求、Learningからの最適化案、CEOからの命令など、あらゆるInputからTask（Execution Unit）を生成する唯一の製造入口。

* **Task OS (Lifecycle Manager)**
  Taskの「Lifecycle（誕生から完了・廃棄まで）」を管理するカーネルモジュール。Taskそのものではなく、Task Flow（仕事の流れ：READY, RUNNING, RECOVERING等）を管理し、決して流れを止めない責任を持つ。

* **Flow Controller**
  人やAIを管理するのではなく、全体のTransformationフローが遅延なく流れているかを制御するレイヤー。

* **Automation Runtime (神経系)**
  Event, Queue, Priority, Timeout, Retry, Scheduler等を内包する巨大な神経ネットワーク。

* **Engine (エンジン)**
  Task OS に接続され、特定の処理（Contractの判定、Evidenceの生成、Diagnosis、Recovery）を行う機能モジュール群。

* **Resource Pool**
  Execution Unit を処理する交換可能な計算資源のプール。Claude, GPT, Gemini, Cursor, Antigravity IDE, Docker, GitHub Actions, Playwright, MCP, データベース、そして人間まで、すべての実行手段を統合したプール。

* **Learning Runtime**
  バックグラウンドで常時稼働し、LedgersからKnowledge Baseを更新して未来のコストを下げるエンジン。

## Operational Terminology (運用用語)

* **Goal (入力)**
  システムに入力される目標。このシステムではGoalは「処理」されるものではなく、Engineによって「変換」されるものである。

* **Value (価値)**
  Transformation Runtime によってGoalから変換された、社会・依頼者に対する絶対的成果。本システムの唯一の商品。

* **Task Flow (仕事の流れ)**
  Task OS が管理する状態遷移。Taskそのものではなく、この「流れ」こそが会社の本体である。

* **Execution Unit (実行最小単位)**
  Task Factory によって分解された最終形態。Resource Pool に直接投入される単位。

* **Evidence (証拠)**
  システムが唯一信用する情報。再現可能でなければならない。

* **Contract (法律・契約)**
  Task の完了条件。Execution より前に固定され、実装中の変更は禁止される。

* **Ledgers (記憶領域)**
  Evidence, Contract, Task, Execution, Learning に分割された、システムの Single Source of Truth。

* **Diagnosis (診断)**
  Contractの判定が FAIL になった際、Evidenceと過去履歴を用いて「症状」から「根本原因（Root Cause）」を特定するプロセス。

* **Recovery (復旧)**
  TaskのLifecycleにおける重大な再編。単なる再試行だけでなく、Split（分割）、Merge（統合）、Replan（再計画）、Recontract（契約修正）を含む。

---
**※本GlossaryはBlueprintとして定義される。100%承認されるまで実装への移行は禁止する。**
