# コマンドライン・オーケストレーター仕様書 (CLI Orchestrator Specification)

## 設計思想 (Philosophy)
> CLI Orchestrator は「AIOSを外部（開発者・人間）から操作する制御用の入り口（Orchestration Entry）」である。
> コマンドを受け取り、パイプラインの起動、および中断されたコンテキストの再開（Resume）といった呼び出し制御に特化しており、
> 決定ロジック（Quality、Governance、Billing、Learning等の判断）は内包せず、すべて後続のカーネルエンジンへ移管する。

---

## 目的
AIOS（品質保証オペレーティングシステム）において、現在定義されている9つのレイヤーの起動および状態管理を安全に行うコマンドラインインターフェース（CLI）制御層のアーキテクチャおよび境界を規定する。

---

## 責責と制限 (Responsibilities & Guardrails)
- **コマンド受付とコンテキスト起動 (Command Dispatching)**:
  - 開発者やシステム自動フック（clasp push 等）からのコマンドを解析し、一意な `RunContext` のもとでカーネルパイプラインを順次実行。
- **実行状態・障害管理 (Run Status & Fault Management)**:
  - パイプライン実行中の現在状態、タイムアウト、および途中の例外エラーを検知・記録。
- **再開制御の調停 (Resume Orchestration)**:
  - 中断されたパイプラインに対して、制限された Scope と検証済み状態を以て安全に再開（Resume）させる。
- **ガードレール：**
  - **ガバナンスバイパスの禁止**: CLI経由であっても、ルール審査や人間承認（Approval Gate）を無視する操作はシステムレベルで一切行えない。
  - **非判断原則**: CLI自体は合否判定や課金可否のロジックを持たず、カーネルの呼び出しと結果の引渡しのみを行う。

---

## 司令塔制御フロー (Command Flow Diagram)
CLI実行は以下の単方向フローによってカーネルを制御し、結果を監査ログへ記録する。

```
[Developer (人間 / コマンド実行)]
               │
               ▼
[CLI Orchestrator (コマンド解析)]
               │
               ├─(Run Context 生成 & CLI Audit 追記)
               ▼
[Kernel Invocation (カーネル呼び出し)]
               │
               ├─(Governance Check & Approval Gate)
               ▼
[AIOS Kernel Pipeline Execution (パイプライン実処理)]
```

---

## シミュレーション用コマンド定義 (Simulation Commands)
本オーケストレーターは、AIOS Kernel の接続整合性をテストするため、以下のシミュレーション専用コマンドをサポートする。

- **simulate-kernel-flow (CMD-003)**:
  - **Name**: `simulate-kernel-flow`
  - **Target**: `Simulation Mock Layer`
  - **引数**: 対象のシナリオID（例: `SCN-NORMAL-001` 等）。
  - **ガードレール**: 本コマンド経由の実行においては、Mock Kernel のみが起動し、本番のカーネルデータ変更・最適化適用・課金決済処理などの本番 Kernel 側書き換え操作はシステムレベルで完全に遮断（禁止）される。

- **test-kernel-simulation (CMD-004)**:
  - **Name**: `test-kernel-simulation`
  - **Target**: `Local Simulation Test Runner`
  - **ガードレール**: 本コマンド経由の実行においては、`SimulationTestRunner` による自動テスト（接続契約、シナリオ回帰、本番隔離アサーション）のみを実行し、本番のカーネルエンジンや実データ（Spreadsheet、Stripe等）は一切起動・干渉させない。また、テストの失敗を無視・隠蔽して強制的に合格（PASS）に書き換えるパラメータは一切持たない。

- **run-quality-gate (CMD-005)**:
  - **Name**: `run-quality-gate`
  - **Target**: `Simulation Hook Runner`
  - **ガードレール**: コミット前フック（`git-pre-commit`）からトリガーされ、自動テスト（`test-kernel-simulation`）の実行と Quality Gate 評価結果を取得。合否の Exit コードを返却してコミットを制御する。

- **run-pre-deploy-check (CMD-006)**:
  - **Name**: `run-pre-deploy-check`
  - **Target**: `Simulation Hook Runner`
  - **ガードレール**: デプロイ前フック（`clasp-pre-deploy`）からトリガーされ、自動テスト結果からデプロイ可否（Allow / Block）を Exit コードで返却する。

---

## 将来拡張ポイント (Future Extensions)
- **CI/CD 自動連携アダプター (CI/CD Git Hook Integration)**:
  GitHub Actions や GitLab CI のワークフローから、コミット差分やデプロイ要求をトリガーとして、自動的に AIOS CLI Orchestrator を呼び出し、リリース前の品質監査・ガバナンスポリシー審査を完全自動実行する連携層の追加。
