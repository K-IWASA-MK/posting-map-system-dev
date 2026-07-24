# Execution Result Standard v1.0 (Generation 9 Phase 3-4)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Execution Result
本仕様書は、AIOS Generation 9（AI Company）において、AI社員が受諾したタスク（Task）の実行完了時または中断・失敗時に出力される実行結果モデルを規定する **Execution Result Standard v1.0** の仕様書である。

Execution Result は、作業セッション（Work Session）の実行結果を要約・分類し、後続の Evidence（検証証跡）取得および Report（報告書生成）へ安全に伝達するための独立した結果表現層として機能する。

### 1.2 コア設計原則: Result Reflects Execution Principle
本仕様は、AI Company の新たな結果表現原則 **`Result Reflects Execution Principle`（結果表現原則）** に完全準拠する。

```
 [Execution (実効処理)] ──► [Execution Result (結果表現)] ──► [Evidence (事実記録)] ──► [Report (要約報告)]
```

- **結果の忠実表現**: Execution Result は実行の結果を誠実に表現・分類する層であり、実行内容を偽装・上書きしたり、存在しない成功結果を捏造して補完したりしてはならない。Result は Execution の客観的事実を要約・分類する責務のみを持つ。

---

## 2. 実行結果ステータス定義 (Result Status)

実行結果（Result）は、以下の 4 つの標準ステータスのいずれかで表現されなければならない。

| ステータス名 (Status) | 定義と条件 |
|---|---|
| **`SUCCESS`** | 定められた全 Objective および Deliverables が正常に作成・検証された状態。 |
| **`PARTIAL_SUCCESS`** | 一部のサブタスクは成功したが、一部の非必須成果物が未達成で終了した状態。 |
| **`FAILED`** | エラー、制約違反、または検証不合格によりタスクが途中で失敗・停止した状態。 |
| **`CANCELLED`** | 人間（CEO）の指示またはタイムアウトにより実行が途中でキャンセルされた状態。 |

---

## 3. エラー分類と再試行適格性 (Error Classification & Recovery)

### 3.1 エラー分類 (Error Categories)

1. **`TRANSIENT_NETWORK_ERROR` (一時的ネットワーク・通信エラー)**:
   APIリクエストタイムアウト、ソケット切断等。一時的な障害。
2. **`AUTH_PERMISSION_ERROR` (認証・権限エラー)**:
   APIキー失効、ファイルパーミッション不足等。権限上の障害。
3. **`VALIDATION_LOGIC_ERROR` (検証・ロジックエラー)**:
   JSONスキーマ不一致、アサーション不合格等。出力結果の不整合。
4. **`RESOURCE_EXHAUSTED_ERROR` (リソース枯渇エラー)**:
   メモリ不足、レートリミット（429 Too Many Requests）到達等。

### 3.2 リカバリ戦略と再試行規律 (Retry Eligibility)

- **自動再試行可能 (Retryable)**: `TRANSIENT_NETWORK_ERROR` および `RESOURCE_EXHAUSTED_ERROR` (指数バックオフ適用時) は、設定された上限回数（例: 最大3回）まで自動再試行が許可される。
- **自動再試行不可 (Non-retryable)**: `AUTH_PERMISSION_ERROR` および `VALIDATION_LOGIC_ERROR` は、自動再試行を行わず即座に `FAILED` / `Execution Suspended` として人間（CEO）へハンドオーバーする。

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P3-4）においては、以下の領域を厳格にスコープ外とする。

- **Performance Evaluation / KPI**: AI社員のパフォーマンス評価、能力採点モデルは含めない。
- **Learning & Self-Improvement**: 失敗原因の自己学習・モデルフィードバックは含めない。
- **Tool Registry**: ツールの実装・登録コードは含めない。
- **Work Session Management**: セッションライフサイクルは含めない（P3-3の責務）。
- **Workforce Governance**: 人間割り込み・強制停止等のガバナンスルールは含めない（P3-5の責務）。
