# Task Standard Foundation v1.0 (Generation 9 Phase 2)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Task の定義
本仕様書は、AIOS Generation 9（AI Company）において、AI社員が受領し自律的に遂行する業務の最小構成単位である **Task（仕事・タスク）** の基本概念、ライフサイクル、責務境界、および基盤依存関係を定義する標準仕様書である。

Generation 9 において、Task とは**「達成すべき明確な目的（Objective）、動作境界（Scope）、および制約条件（Constraints）を伴う、識別可能な仕事の要求単位」**である。

### 1.2 識別可能性 (Unique Identifiability)
すべての Task は、全社（AI Company）内で重複しない一意の識別子（Task ID）によって追跡・照合可能な概念として扱われる。具体的な ID スキーマおよび属性構造は、後続の `TASK.json` 仕様にて確定する。

---

## 2. タスクライフサイクル (Task Lifecycle)

AI社員が仕事を受領してから完了・記録するまでの状態遷移（State Transition）は、以下の 7 段階の標準ライフサイクルに従わなければならない。

```
 [Created] → [Assigned] → [Accepted] → [In Progress] → [Verification] → [Completed] → [Archived]
```

### 各状態（State）の定義

| 状態名 (State) | 状態の定義と遷移条件 |
|---|---|
| **Created** | タスクが発行・生成された初期状態。目的と条件が記述されているが、担当社員は未決定。 |
| **Assigned** | 特定のAI社員（またはAI部署）にタスクが割り当てられた状態。受諾待ち。 |
| **Accepted** | 担当AI社員がタスクの指示内容・制約条件を理解し、業務を引き受けた状態。 |
| **In Progress** | 担当AI社員が指定された道具（Tools）を選択し、業務を実効処理している状態。 |
| **Verification** | 処理成果物について非侵襲テスト・整合性チェックおよび証跡取得を行っている状態。 |
| **Completed** | 検証に合格し、CEO（人間）による最終承認（Proceed）または報告完了が確認された状態。 |
| **Archived** | 完了報告および証跡が全社記録として保存され、歴史的参照用となった状態。 |

---

## 3. タスクの責務範囲 (Task Responsibility)

ひとつの Task は、明確な 3 つの要素によってその責務境界が規定される。

1. **目的 (Objective)**: 「何が達成されればその仕事は成功したと言えるか」の定性的・定量的ゴール。
2. **動作境界 (Scope)**: タスクが触れて良いファイル、ディレクトリ、ドメインの厳格な境界。
3. **制約条件 (Constraints)**: 使用許可ツール、禁止事項、セキュリティポリシー、および必須承認条件。

---

## 4. タスクの境界と非所有領域 (Task Boundary)

単一責任原則（Single Responsibility Principle）およびモジュール独立性を保つため、Task は以下の要素を**自ら所有・内包してはならない**。

- **NOT Employee Identity**: Task はAI社員の権限や人格そのものではない。（Task は Employee に割り当てられる対象である）
- **NOT Department**: Task は組織構造そのものではない。（Task は Department/Section を通過する仕事である）
- **NOT Runtime / Engine**: Task は処理を実行するスクリプトや実行エンジンそのものではない。
- **NOT Governance**: Task は憲法や全社ルールそのものではない。（Task は Governance の制約下で動く）

---

## 5. 基盤依存性原則 (Foundation Dependency Principle)

### 5.1 第6基本原則 Separation of Foundation Principle との関係
本仕様は、Generation 9 憲法第6基本原則 **`Separation of Foundation Principle`（基盤分離の原則）** に完全準拠する。

```
 [Foundation Layer]
  ├── Employee Identity (v2.0)
  ├── Organization SSOT (departments.json)
  └── Governance Standard (SOP)
         ▲
         │ (Depends On / Task は Foundation に依存する)
         │ (Task Never Becomes Foundation / Task は絶対基盤化しない)
 [Work Layer]
  └── Task (Phase 2 Foundation)
```

### 5.2 依存関係のルール
1. **一方向依存の徹底**: Task は Employee（誰がやるか）、Organization（どの部署か）、Governance（どうやるか）を参照・依存できるが、Foundation（基盤層）が個別の Task に依存してはならない。
2. **基盤化の禁止**: タスクの内容や一時的な要求が、全社憲法や社員Identityの基本構造を書き換えてはならない。

---

## 6. 運用および互換性指針 (Operational Guidance)

- **Phase 2 スコープ制限**: 本仕様書は Task の概念定義のみに特化し、具体的な JSON スキーマ（`TASK.json`）、割り当てモデル（`Assignment Model`）、証跡モデル（`Evidence Model`）、報告モデル（`Report Model`）は、それぞれ独立した単一責任スプリントにて順次定義する。
