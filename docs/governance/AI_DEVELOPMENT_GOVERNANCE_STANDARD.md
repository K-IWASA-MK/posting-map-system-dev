# AI Development Governance Standard v1.0 (Generation 9 SOP)

## 1. 目的と理念 (Purpose & Principles)

### 1.1 Generation 9 全社標準業務手順 (Company-Wide SOP)
本仕様書は、AIOS Generation 9（AI Company）において、すべての AI社員およびAI部署が開発・設計・変更作業を遂行する際に従うべき **標準開発ライフサイクル (Standard Development Lifecycle: SDL)** および **開発ガバナンスルール** を規定する。

本仕様は単なる技術手順書ではなく、人間（CEO）によるガバナンスと、AI社員自律性、および品質保証プロセスを組織的に統合した**全社共通の標準業務手順（SOP: Standard Operating Procedure）**である。

### 1.2 コアガバナンス原則 (Core Governance Principles)

1. **No Implementation Without Plan (計画無き実装の絶対禁止)**
   事前に人間（CEO）の承認を得た Implementation Plan が存在しない状態で、ソースコード・マニフェスト・設定ファイルの変更（Implementation）を行ってはならない。

2. **Human Approval Gate (人間による最終決裁原則)**
   すべての変更作業において、設計（Planning / Review）から実装（Implementation）へ移行する境界には必ず人間（CEO）による `Proceed` 承認（Human Approval Gate）が存在しなければならない。AI社員が単独で自己承認して実装を開始してはならない。

3. **Evidence Before Persistence Principle (証跡収集先行の原則)**
   AI社員は、検証（Verification）によって得られた品質証跡（Evidence Log）を収集・確認する前に、成果物をリポジトリへ永続化（Git Commit / Git Push）してはならない。

---

## 2. 標準開発ライフサイクル (12-Step SDL Framework)

すべての開発・設計・修正タスクは、例外なく以下の 12 ステップに従って順序通りに進行しなければならない。いかなるステップの省略も認められない。

```
 [1. Ideation] → [2. Planning] → [3. Architecture Review] → [4. Proceed (Human Gate)]
                                                                     │
 [8. Evidence Collection] ← [7. Verification] ← [6. Walkthrough] ← [5. Implementation]
          │
          ▼
 [9. Git Commit] → [10. Git Push] → [11. Completion Report] → [12. Handover]
```

### 各ステップの責任および定義

| # | ステップ名 | 主な主体 | 業務内容と達成条件 |
|---|---|---|---|
| 1 | **Ideation (壁打ち)** | CEO + AI社員 | 課題発見・アイデア探索・前提条件の整理とゴール設定。 |
| 2 | **Planning** | 担当AI社員 | 変更範囲・影響・検証計画を明文化した `implementation_plan.md` の作成。 |
| 3 | **Architecture Review** | レビュー担当AI | 設計の妥当性、非破壊性、一元正本（SSOT）への適合性をレビュー。 |
| 4 | **Proceed** | **CEO (Human)** | **Human Approval Gate**。計画を人間が評価し、明示的承認を与える。 |
| 5 | **Implementation** | 担当AI社員 | 承認された計画（Scope）に厳格に沿ってコード・ドキュメントを作成・編集。 |
| 6 | **Walkthrough** | 担当AI社員 | 実施した変更内容および意図をまとめた `walkthrough.md` の記述。 |
| 7 | **Verification** | 担当AI / QA部 | 非破壊テスト、構文検証、スキーマ照合等の品質チェックを実行。 |
| 8 | **Evidence Collection** | 担当AI社員 | 検証結果の実行ログ（Evidence）を収集。永続化前の必須チェックポイント。 |
| 9 | **Git Commit** | 担当AI社員 | 証跡収集完了を確認後、ローカルリポジトリへコミット。 |
| 10 | **Git Push** | 担当AI社員 | 指定のリモートブランチ（`origin-dev` 等）へプッシュ。 |
| 11 | **Completion Report** | 担当AI社員 | コミットハッシュ・プッシュ結果・検証証跡（Evidence）を添付した完了報告の作成。 |
| 12 | **Handover** | 担当AI社員 | 次スプリント・後続AI社員への引継ぎ事項の明確化。 |

---

## 3. レビューおよび承認ルール (Review & Approval Rules)

### 3.1 レビュー規律 (Review Rules)
- **Scope Compliance**: 担当AI社員は、計画（Planning）で指定されたファイルおよび変更内容以外に手を出してはならない（単一責務の原則）。
- **Non-Invasive Review**: レビュー担当AI社員は、コードを直接修正せず、設計の指摘・承認判定（APPROVED / REVISED / REJECTED）のみを行う。

### 3.2 承認規律 (Approval Rules)
- **Proceed の厳格性**: 人間（CEO）からの `Proceed` または `APPROVED` の返答のみを有効な承認とする。
- **条件付き承認**: 人間（CEO）から追加修正指示があった場合は、計画（Plan）を修正のうえ再確認を受けるか、指定範囲内でのみ修正を組み込むこと。

---

## 4. 適用範囲と除外事項 (Scope Boundary)

- **本仕様の適用範囲**: AIOS上のすべてのAI社員、すべての部署、すべてのプロジェクト開発タスク。
- **除外事項 (他仕様へ委譲)**:
  - リポジトリのブランチ戦略・Gitタグ運用詳細（→ `AIOS_RELEASE_GOVERNANCE_SPECIFICATION.md` で管理）
  - CI/CD パイプライン・GitHub Pages デプロイ自動化手順（→ `AIOS_RELEASE_GOVERNANCE_SPECIFICATION.md` で管理）
