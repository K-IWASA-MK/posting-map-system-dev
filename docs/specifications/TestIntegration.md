# テスト統合仕様書 (Test Integration Specification)

## 概要 (Overview)
テスト統合レイヤー（Test Integration Layer）は、ローカルシミュレーションテスト環境と開発者の日々の開発ワークフロー（Git コミット、claspデプロイ等）を安全に仲介し、不整合なコードのコミットやデプロイを自動的に遮断（Quality Gate Block）するための結合境界である。

---

## 接続要件 (Integration Points)

### 1. Git Commit 接続
- **トリガー**: `git commit` 操作の実行時。
- **起動項目**: `tools/hooks/pre-commit-simulation.sh` -> `hook_runner.js`。
- **挙動**: 自動でシミュレーションテストを実行。Quality Gate の判定結果を取得し、合否に応じてコミットの可否（Allow / Block）を調停する。

### 2. Deploy Flow 接続
- **トリガー**: `clasp push` またはリリース操作の実行前。
- **起動項目**: `tools/hooks/pre-deploy-simulation.sh` -> `hook_runner.js`。
- **挙動**: 自動でシミュレーションテストを実行。接続契約および本番隔離（Boundary）に違反していない場合のみ、デプロイ実行を許可する。

---

## 障害・不合格時ハンドリング (Failure Handling)
テストスイートの検証中に、いずれか 1 件でもエラー（FAIL）が検出された場合、統合レイヤーは以下の手順で厳格に処理を制御する。

- **Exit Code 制御**:
  - 品質ゲート（Quality Gate）の判定が不合格の場合、`hook_runner.js` は即座に `Exit Code != 0` （例: `1`）を返して終了する。これによって、Git 操作やシェル実行プロセスが決定論的に Block（阻止）される。
- **Bypass（バイパス）の排除**:
  - エラー発生時、特定の環境変数やフラグ（`--no-verify` の推奨など）を用いて品質アサーションをスキップ（Skip）または強制パス（Force PASS）させる設計は、システムレベルで一切サポート・許可しない。

---

## 監査フロー (Audit Flow)
各フック実行開始および終了判定は、不変監査モデル（`HookExecutionAudit`）に従い、追記のみ（Append-Only）で記録される。
