# Workforce Execution Standard v1.0 (Generation 9 Phase 3-1)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Workforce Execution の位置付け
本仕様書は、AIOS Generation 9（AI Company）において、AI社員が割り当てられたタスク（Task）を受領してから完了・アーカイブするまでの **自律業務実行フロー (Workforce Execution Flow)** を規定する標準仕様書である。

Phase 1（Employee Foundation）および Phase 2（Task Foundation）で確立された土台に基づき、「社員がどのように順序立てて自律的に仕事を進めるか」という抽象フローを統一化する。

### 1.2 コア設計原則: Execution Is Observable Principle
本仕様は、AI Company 第8基本原則 **`Execution Is Observable Principle`（実行観測可能性原則）** に完全準拠する。

- **全工程の観測性担保**: AI社員の業務実行における開始、受諾、ツール選択、実効処理、証跡取得、報告、および完了は、すべて観測可能（Observable）なイベントおよびログとして追跡記録されなければならない。

---

## 2. 自律業務実行フロー (Execution Flow Specification)

AI社員が仕事を受領してからクローズするまでの標準フローは、以下の 8 段階のシリアルステップに従わなければならない。

```
 [1. Task Assigned] ──► [2. Task Accepted] ──► [3. Tool Selection] ──► [4. Execution]
                                                                            │
 [8. Task Closed]   ◄── [7. CEO Approval]  ◄── [6. Report Generation] ◄── [5. Evidence Collection]
```

### 各実行フェーズの定義と移動条件

| # | 実行フェーズ | フェーズの目的とアクション | 遷移条件 / 完了条件 |
|---|---|---|---|
| 1 | **Task Assigned** | タスク割当レコード（`assignmentId`）が担当AI社員へ送達された状態。 | 割当通知の正常受領。 |
| 2 | **Task Accepted** | 担当AI社員がタスクの目的（Objective）、動作境界（Scope）、制約（Constraints）を確認し受諾した状態。 | 業務開始条件の整合確認完了。 |
| 3 | **Tool Selection** | タスク遂行に必要な Capability（能力）および道具（Tools）を特定・準備する状態。 | 使用許可ツール・アクセス権限の照合完了。 |
| 4 | **Execution** | 担当AI社員が選択したツールを用いて実際のコード作成、データ解析、検証準備を行う作業状態。 | 予定されたアウトプットの生成完了。 |
| 5 | **Evidence Collection** | 実行結果に対し、SHA-256 チェックサム、ログ、テスト結果等の不可変証跡（Evidence）を取得・記録する状態。 | `Evidence Is Immutable Principle` に基づく証跡保存。 |
| 6 | **Report Generation** | 取得された証跡を参照し、成果と合否結果を要約した完了報告書（Report）を生成する状態。 | `Report References Evidence Principle` に基づくレポート作成。 |
| 7 | **CEO Approval** | 生成された Report および Evidence を人間（CEO）へ提出し、`Proceed` / `APPROVED` 判定を受ける状態。 | 人間（CEO）による明示的承認の獲得。 |
| 8 | **Task Closed** | CEOの承認を受け、タスクおよびアサインメントのステータスを `Completed` / `Archived` へ更新し業務をクローズした状態。 | 全ログの保存およびリソース解放。 |

---

## 3. 実行観測性およびイベント記録 (Execution Observability)

1. **イベント発火**: 各フェーズ移動時（1〜8）に、一意なタイムスタンプ、担当 `employeeId`、対象 `taskId` を伴う実行イベントが発行される。
2. **エラー・中断時の観測性**: 処理中にエラーや制約違反が発生した場合、即座に `Execution Failed` または `Execution Suspended` イベントが発火され、その原因がログとして記録される。

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P3-1）においては、以下の領域を厳格にスコープ外とする。

- **Tool Selection Specifications (P3-2)**: Chrome DevTools, Git, GAS, Python 等の具体的なツール識別子および選択ロジックは記述しない（P3-2の責務）。
- **Work Session Model (P3-3)**: コンテキスト保持、セッション復元モデルは含めない。
- **Execution Result & Recovery (P3-4)**: エラーリカバリ、再試行メカニズムは含めない。
- **Execution Governance (P3-5)**: 人間割り込み・強制停止等のガバナンス統合ルールは含めない。
