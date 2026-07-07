# シミュレーションシナリオ仕様書 (Simulation Scenario Specification)

## 目的
AIOS（品質保証オペレーティングシステム）の統合検証環境において、各レイヤー間の接続可能性、例外処理、および状態変更を検証するためにシミュレーターが実行する「検証シナリオ（Simulation Scenarios）」のパターンおよび流れを規定する。

---

## シナリオパターン (Scenario Patterns)
接続テストを実行するため、少なくとも以下の3つのシナリオを構成する。

### 1. 正常系フロー (Normal Flow)
- **目的**: パイプラインを構成する主要カーネルが不整合を起こさずに実行でき、最終出力（Output）まで正常遷移することを確認。
- **シーケンス**:
  ```
  [Execution (文法チェックOK)] ──> [Review (違反なし)] ──> [Quality (高スコア確定)]
                                                                  │
                                                                  ▼
  [Output (ユーザー提示)] <── [Governance (Bypassed認可)] <── [Learning (成功学習)]
  ```

### 2. 異常系・改善ループフロー (Error Flow)
- **目的**: 品質不適合（FAIL）または AI Smell レベル違反が発生した際、早期終了（Early Termination）して自己改善ループおよび監査保存が行われることを確認。
- **シーケンス**:
  ```
  [Execution (コード差分)] ──> [Review (AI Smell 検出)] ──> [Quality (70点以下 FAIL 確定)]
                                                                  │
                                                                  ├─(早期終了・改善移行)
                                                                  ▼
  [Audit Record (監査ログ保存)] <── [Self Improvement (修正)] <── [Self Review (要改善判定)]
  ```

### 3. ガバナンス・承認ゲートフロー (Approval Flow)
- **目的**: 重大アクション（ナレッジ公式昇格等）が検知された際、自動で進まず承認保留（Pending）となり、人間（管理者）の判断結果に従って動作することを確認。
- **シーケンス**:
  ```
  [Knowledge Optimization (公式昇格推奨)] ──> [Governance (ポリシー適合・承認必要と判定)]
                                                         │
                                                         ▼
  [Human Decision (人間の承認/却下)] ──> [Approval Pending (承認ゲート起動・一時保留)]
  ```

---

## シナリオデータ構造 (Scenario Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SimulationScenarioDefinition",
  "type": "object",
  "properties": {
    "scenarioId": { "type": "string" },
    "scenarioName": { "type": "string" },
    "targetFlow": {
      "type": "string",
      "enum": ["NormalFlow", "ErrorFlow", "ApprovalFlow"]
    },
    "mockInputs": {
      "type": "array",
      "items": { "type": "object" }
    }
  },
  "required": ["scenarioId", "scenarioName", "targetFlow", "mockInputs"]
}
```
