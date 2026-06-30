# AIOS Development OS Specification (開発統制規範)

Version: 1.0.0
Phase: Phase 101 (Development OS Foundation)
Status: Approved

---

## 1. 目的 (Purpose)
本仕様書は、AIOS (Artificial Intelligence Operating System) および CIE (Code Intelligence Engine) プラットフォーム開発におけるガバナンスと統制フローを公式定義し、AI開発モデルおよび開発者の行動規範となる「開発憲法」を制定することを目的とします。

---

## 2. 適用範囲 (Scope)
本仕様書は、CIEプラットフォームに関わるすべてのソースコード変更、仕様・計画の策定、テストケースの追加、およびGitリポジトリ操作（コミット・プッシュ）に対して適用されます。

---

## 3. 開発原則 (Development Principles - "開発憲法")
すべての開発AIおよび開発者は、以下の原則を例外なく厳格に順守しなければなりません。

1. **Foundation First (基盤優先)**:
   プラットフォーム全体の安定性、後方互換性、およびテスト検証容易性を最優先します。既存のJSON成果物およびスキーマ仕様の整合性を最優先に維持します。
2. **One Phase = One Responsibility (単一責任)**:
   1つのフェーズ（ステップ）では必ず単一の責務（モジュール、機能、課題）のみを対象として実装・更新します。複数の関心事を同時に混入させることを厳禁とします。
3. **Blueprint Before Implementation (設計優先)**:
   コードを書き換える前に、必ずそのフェーズの目的、変更ファイル、およびテスト計画を明記した設計・計画書（Implementation Plan）を作成します。
4. **Review Before GO (GO前の査読)**:
   実装を開始する前に、必ず計画書を岩佐CEOに提出し、査読・承認を得なければなりません。
5. **Deterministic Design (決定論的設計)**:
   すべてのID導出、データ構造、および実行フローは決定論的（同一入力に対して常に同一の出力）でなければなりません。
6. **Stateless Design (ステートレス設計)**:
   DTOマネージャやシミュレーションモジュールにおいて、内部状態を持たず、関数の呼び出し時点で完結するように設計します。
7. **No Mutation (不変性維持)**:
   入力DTOオブジェクトの値を直接書き換える破壊的操作（Mutation）を禁止します。常に新規インスタンスを構築して返却し、メタデータ辞書等は `metadata.copy()` を用いてインスタンスを物理的に分離します。
8. **No Side Effect (不要な副作用の排除)**:
   設計モデルの構築において、実際のファイルシステム操作、並行スレッドの起動、外部I/O通信などの不要な副作用を排除し、純粋な定義コンパイルに専念します。

---

## 4. フェーズライフサイクル (Phase Lifecycle)
各開発フェーズは以下の6つの段階を経て進行します。

```
[1. 企画 (Proposal)] ──> [2. 計画 (Plan: Implementation Plan)] ──> [3. レビュー (Review & GO)]
                                                                         │
[6. 完了 (Done: HANDOVER)] <── [5. 検証 (Verify: pytest/verify)] <── [4. 実装 (Implement)]
```

1. **企画 (Proposal)**: 目的とスコープの明確化。
2. **計画 (Plan)**: `implementation_plan.md` の作成。
3. **レビュー (Review & GO)**: 計画書に対する岩佐CEOの確認、フィードバック、および「GO」の受領。
4. **実装 (Implement)**: `task.md` のTODOに基づき、対象ファイルのみの段階的変更を適用。
5. **検証 (Verify)**: pytest の合格確認、および CLI verification/doctor コマンドによる全体健全性検証。
6. **完了 (Done)**: `walkthrough.md` で結果を報告し、`HANDOVER.md` を更新、Gitコミット＆プッシュを実行して終了。

---

## 5. レビューおよび「GO」ワークフロー (Review & GO Workflow)
* 計画段階では、AIはいかなるソースコードの変更、テスト実行、Gitコミット、HANDOVER更新も行ってはなりません。
* 計画が承認され、岩佐CEOから明示的な「GO」の合意が出た段階で初めて実装ステージへの移行が許可されます。

---

## 6. Git ワークフロー (Git Workflow)
* **コミット粒度**: コミットは1つの責任（フェーズ完了）ごとにまとめます。
* **コミットメッセージ**: `CIE Phase <N>: <Name>` の形式を厳守します。
* **リモートポリシー**: 
  * 開発・変更は常に `origin-dev`（`posting-map-system-dev` リポジトリ）の `main` ブランチに対して行います。
  * `git push origin-dev HEAD:main`
  * `origin`（本番バックアップ用）リポジトリへの直接プッシュは厳禁とします。
* **クリーンツリー**: コミット・プッシュ前には必ず `git status` で余剰なデバッグ用ファイルや一時ファイルが存在しないことを確認します。

---

## 7. ドキュメント管理ポリシー (Documentation Policy)
* `task.md`: 実装中のタスク進行状況を管理するTODOファイル。
* `walkthrough.md`: 完了時に実行結果、テスト結果、生成された差分（Diff）等をまとめるレポート。
* `HANDOVER.md`: 開発フェーズの引き継ぎ位置情報を正確に記録し、次のフェーズのアクションを示すファイル。

---

## 8. フェーズ完了定義 (Completion Policy / Definition of Done)
以下のすべての条件が満たされた場合にのみ、そのフェーズを「完了 (Done)」と判定します。
* [ ] すべての実装コードが原則に基づいて完了していること。
* [ ] pytest ユニットテストがすべて PASS していること。
* [ ] `python3 tools/cie.py verify` が PASS していること。
* [ ] `python3 tools/cie.py doctor` が GOOD ステータスを示していること。
* [ ] `HANDOVER.md` の現在地・Completed 項目がインクリメントされ、次のタスクが正しく指し示されていること。
* [ ] `walkthrough.md` が最新の状態に更新されていること。
* [ ] `git status` に未トラッキングの不要なファイルがなく、ワーキングツリーが完全にクリーンであること。
* [ ] `git push` が規定のリモートリポジトリに対して成功していること。
