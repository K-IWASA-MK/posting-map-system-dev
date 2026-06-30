# CIE Platform Development Handover (CIE AIOS Core)

次回の担当AIへ。以下のコンテキストを読み込み、開発ルールと現在地を確認して作業を開始してください。

---

## 📍 1. Current Location (現在地)

- **Platform**: `CIE Platform v2.2.0-alpha.0`
- **Completed**: `Phase90`, `Foundation Fix Pack v1`
- **Current Phase**: `Phase91 (Waiting for Implementation Plan)`
- **Next Action**: `Create Implementation Plan for Phase91`
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
- **Milestone Audit**: 節目のフェーズ（Phase 100 / 200 / 300）到達時は、Foundation Audit、サードパーティレビュー、および Fix Pack による全体品質の引き締めを実施する。

---

## 🗺️ 3. Roadmap (ロードマップ)

- **Foundation** (Phase1-90) ✅
- **Execution Runtime** (Phase91-120)
- **Execution Engine** (Phase121-180)
- **Distributed Runtime** (Phase181-240)
- **AIOS Core** (Phase241-300)

---

## 📦 4. Git Information

- **Latest Commit**: Use `git log -1` to check the current HEAD commit details.
- **Commit History**: Keep only the latest 5 commits. (Older history should be retrieved using `git log`.)

---

## 🚀 Startup Checklist

Before starting development:

1. Read Current Location
2. Create Implementation Plan
3. Review
4. Implementation
5. Verify
6. Git Commit
7. Push
