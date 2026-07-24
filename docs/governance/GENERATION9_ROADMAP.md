# Generation 9 AI Company OS Roadmap

## 1. ビジョンと最終目的 (Vision & Ultimate Goal)

> **「AI社員が自律的に働き、人間は経営者として承認と経営判断を行う AI Company を AIOS 上に構築する。」**

Generation 9 において、AIOS は単なる処理実行環境（Runtime）から、**AI組織を統制・運用するプラットフォーム（AI Company OS）**へと進化する。

---

## 2. フェーズ別ロードマップ (Phased Roadmap)

| フェーズ | フェーズ名 | 状態 | 目的と概要 |
|---|---|---|---|
| **Phase 1** | **Employee Foundation** | ✅ **100% COMPLETED** | 社員証標準 (Identity v2.0)、組織図 (departments.json)、12ステップSDL SOP、憲法統合の完了。 |
| **Phase 2** | **Task Foundation** | ✅ **100% COMPLETED** | Task 概念、TASK.json マニフェスト、Assignment 参照構造、Evidence 不可変モデル、Report 参照モデルの完結。 |
| **Phase 3** | **Workforce Execution** | ✅ **100% COMPLETED** | 自律実行フロー、能力起点ツール選択、作業セッション、実行結果、人間介入ガバナンスの完結。 |
| **Phase 4** | **Department Collaboration** | 🟦 **NEXT** | 部署間（開発部 → QA部 → セキュリティ部 → CEO）のレビュー・バトンリレー文化の自動化。 |
| **Phase 5** | **AI Company Complete** | ⚪ Planned | 評価・昇格・異動・教育・監査を含めた AI Company OS 全体エコシステムの完成。 |
| **Backlog** | **Platform Promotion** | ⚪ Backlog | POSTING MAP 配下で実証された成果物・機能を AIOS 共通基盤へ昇格させる専用スプリント。 |

---

## 3. Phase 1 実績アーカイブ (Phase 1 Delivered Artifacts)

- **G9-P1-1 (Identity Specification)**: [AI Employee Identity Standard v2.0](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/AI_EMPLOYEE_IDENTITY_STANDARD.md)
- **G9-P1-2 (Employee Manifest Migration)**: 既存4名 `EMPLOYEE.json` 非破壊 v2.0 移行完了
- **G9-P1-3 (Organization SSOT)**: [Organization SSOT (departments.json)](file:///Volumes/SSD_DATA/AI%20Development%20OS/AI%E7%A4%BE%E5%93%A1/departments.json)
- **G9-P1-4 (Development Governance SOP)**: [AI Development Governance Standard](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/AI_DEVELOPMENT_GOVERNANCE_STANDARD.md)
- **G9-P1-5 (Constitution Binding)**: [AGENTS.md (Gen9 憲法・6大基本原則統合)](file:///Volumes/SSD_DATA/AI%20Development%20OS/AGENTS.md)

---

## 4. Phase 2 実績アーカイブ (Phase 2 Delivered Artifacts)

- **G9-P2-1 (Task Concept & Lifecycle)**: [TASK_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/TASK_STANDARD.md)
- **G9-P2-2 (Task Manifest Schema)**: [AI_TASK_MANIFEST_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/AI_TASK_MANIFEST_STANDARD.md)
- **G9-P2-3 (Task Assignment Layer)**: [AI_TASK_ASSIGNMENT_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/AI_TASK_ASSIGNMENT_STANDARD.md)
- **G9-P2-4 (Task Evidence Layer)**: [AI_TASK_EVIDENCE_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/AI_TASK_EVIDENCE_STANDARD.md)
- **G9-P2-5 (Task Report Layer)**: [AI_TASK_REPORT_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/AI_TASK_REPORT_STANDARD.md)

---

## 5. Phase 3 実績アーカイブ (Phase 3 Delivered Artifacts)

- **G9-P3-1 (Execution Flow Standard)**: [WORKFORCE_EXECUTION_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/WORKFORCE_EXECUTION_STANDARD.md)
- **G9-P3-2 (Capability-based Tool Selection)**: [TOOL_SELECTION_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/TOOL_SELECTION_STANDARD.md)
- **G9-P3-3 (Work Session & Checkpoint)**: [WORK_SESSION_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/WORK_SESSION_STANDARD.md)
- **G9-P3-4 (Execution Result & Recovery)**: [EXECUTION_RESULT_STANDARD.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/EXECUTION_RESULT_STANDARD.md)
- **G9-P3-5 (Workforce Execution Governance)**: [WORKFORCE_EXECUTION_GOVERNANCE.md](file:///Volumes/SSD_DATA/AI%20Development%20OS/docs/governance/WORKFORCE_EXECUTION_GOVERNANCE.md)

---

## 6. バックログおよびプラットフォーム昇格方針 (Backlog & Platform Promotion)

- **Tool Registry**: AI社員が選択・利用可能なツール群（Chrome, Git, GitHub API, GAS, Python, Filesystem 等）を一元管理・提供する独立レジストリ。
- **Platform Promotion Sprint**: POSTING MAP 配下で実証・運用された各種機能および基盤仕様を、AIOS プラットフォーム共通領域（`AIOS/organization/`, `AIOS/tasks/`, `AIOS/execution/`, `AIOS/tool-registry/`）へ配置移動（昇格）させる専用スプリント。昇格時は機能変更を行わず非侵襲配置のみを実施する。
