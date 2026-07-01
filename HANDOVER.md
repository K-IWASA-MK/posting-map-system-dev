# AIOS Platform Development Handover (AIOS Core)

次回の担当AIへ。以下のコンテキストを読み込み、開発ルールと現在地を確認して作業を開始してください。

---

## 📍 1. Current Location (現在地)

- **Platform**: `CIE Platform v2.2.0-alpha.0`
- **Completed**: `Phase142`
- **Current Phase**: `Phase143`
- **Next Action**: `Create Implementation Plan for Phase143`
- **Branch**: `main`

---

## ⚙️ 2. Development Rules (開発ルール)

次の担当AIが確実に順守すべき開発プロセス・ポリシーです。

- **Foundation First**: 常に基盤の整合性と動作保証を最優先とする。
- **Implementation Plan Required**: 実装前に必ず実行計画を作成・提示する。
- **Review Required**: 実装・変更の開始には必ず岩佐CEOの承認（GO）を得る。
- **One Responsibility per Step**: 1ステップにつき1つの責務のみを実装・更新する。
- **Verify Required**: コミット前に必ず健全性検証を実行する。
- **Git Commit Required**: 正常動作を確認した段階でローカルコミットを行う。
- **Git Push Policy**: The AI may perform Git Push after the approved implementation workflow, subject to the configured Review Policy.
- **Milestone Audit**: 節目のフェーズ（Phase 100 / 200 / 300）到達時は、Foundation Audit、サードパーティレビュー、および Fix Pack による全体品質の引き締めを実施する。

---

## 🤖 3. AIOS Standard Communication Specification (ASCS)

- **Version**: `ASCS v1.0`
- **Purpose**: Standard communication protocol for AI-to-AI / AI-to-Human collaboration.
- **Scope**: Applies to all AIOS development projects and environments.

### Requirements (通信規約)
- **Single Code Block Rule**: 回答は必ず1つのマークダウンコードブロックのみで提出すること。コードブロック外への文章・補足・説明・前置き・あとがきは例外なく一切禁止する。
- **Output Rule**: 回答は追加説明が不要な完成版のみを出力し、途中でユーザーへの追加説明の要求や質問を行わないこと。
- **Copy Safe Rule**: すべての回答は GPT ➔ User ➔ Flash ➔ Claude ➔ Gemini などの AI 間でコピー＆ペーストされることを前提として作成し、途中でコンテキストや情報が欠落する構成は禁止する。

---

## 📞 4. AI Communication Rules (協調規約)

AIOS 開発エージェント間で引き継ぎされるべき通信・作業の前提条件です。

- 回答は実装可能な完成版のみを提出し、そのまま採用・実行可能なコードや計画を提示すること。
- 過去に合意した Development Rules を確実に継承して引き継ぐこと。

---

## 🗺️ 5. Roadmap (ロードマップ)

- **Foundation** (Phase1-90) ✅
- **Execution Runtime** (Phase91-120)
- **Execution Engine** (Phase121-180)
- **Distributed Runtime** (Phase181-240)
- **AIOS Core** (Phase241-300)

---

## 📦 6. Git Information

- **Latest Commit**: Use `git log -1` to check the current HEAD commit details.
- **Commit History**: Keep only the latest 5 commits. (Older history should be retrieved using `git log`.)

---

## 🚀 Startup Checklist

Before starting development:

1. Read Current Location
2. Create Implementation Plan
3. Review & Approval (GO)
4. Implementation
5. Verify (CIE verify)
6. Doctor (CIE doctor)
7. pytest
8. HANDOVER.md Update
9. Git Commit
10. Git Push (Subject to Review Policy)
11. Completion Report (Verify Commit Hash, Verify/Doctor PASS, pytest PASS, HANDOVER updated, Push completed, Working Tree Clean)

