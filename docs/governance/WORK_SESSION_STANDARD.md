# Work Session Standard v1.0 (Generation 9 Phase 3-3)

## 1. 概要と目的 (Overview & Purpose)

### 1.1 Generation 9 における Work Session
本仕様書は、AIOS Generation 9（AI Company）において、AI社員がタスク（Task）の実行中に保持する一時的な作業コンテキストおよび実行状態（In-Flight Execution State）を管理する **Work Session Standard v1.0** の仕様書である。

Work Session は、タスク実行中のコンテキスト維持、中断（Suspend）、再開（Resume）、およびタイムアウト制御を担う独立した作業セッション管理モデルを規定する。

### 1.2 コア設計原則: Session Preserves Context Principle
本仕様は、AI Company の新たなセッション管理原則 **`Session Preserves Context Principle`（セッションコンテキスト保持原則）** に完全準拠する。

- **一時的実行状態の管理**: Work Session は Task 実行に必要なコンテキスト（作業メモリ、中間状態）を保持するが、Task、Employee、Evidence の永続モデルを直接書き換えてはならない。
- **データ永続層との分離**: Session はあくまで実行中の一時的な状態（Transient State）を扱う責務のみを持ち、作業完了または中断時には確定した成果物およびエビデンスを永続層へとハンドオーバーしなければならない。

---

## 2. セッションライフサイクル (Session Lifecycle)

Work Session は、以下の 5 つの状態遷移に従って管理される。

```
 [Session Active] ──► [Checkpoint] ──► [Suspended] ──► [Resumed] ──► [Terminated]
```

| 状態名 (State) | 定義と遷移条件 |
|---|---|
| **Session Active** | 担当AI社員がタスクの実効処理を開始し、コンテキストがアクティブに保持されている状態。 |
| **Checkpoint** | 長時間処理やマルチステップ作業において、復元可能な中間コンテキストが保存された状態。 |
| **Suspended** | 人間承認（Proceed待ち）、ネットワーク瞬断、またはフォールバック不可により作業が一時中断された状態。 |
| **Resumed** | 承認獲得または環境復旧により、最後にとった Checkpoint から作業コンテキストが再開された状態。 |
| **Terminated** | 作業が完全終了（成功完了、または回復不能な失敗）し、一時コンテキストが正常に破棄・クローズされた状態。 |

---

## 3. コンテキスト保持とチェックポイント規律 (Context & Checkpoint Rules)

1. **Checkpoint の作成規律**:
   長時間に及ぶバッチ処理や複数ステップの作業を行う場合、AI社員はステップの区切りごとに中間状態（Checkpoint）を保存しなければならない。
2. **安全な再開 (Safe Resume)**:
   セッションが中断（Suspended）された後、再開（Resumed）する際は、最初から作業をやり直すのではなく、直近の有効な Checkpoint から処理を復元・再開しなければならない。
3. **Timeout ポリシー**:
   セッションが無応答または応答停止状態で規定時間（例: 300秒）を超過した場合、セッションは自動的に `Suspended` へ移行し、安全停止イベントを発火する。

---

## 4. スコープ境界と範囲外事項 (Scope Boundary & Exclusions)

本スプリント（P3-3）においては、以下の領域を厳格にスコープ外とする。

- **Tool Selection Logic**: ツールの選定ロジックは含まない（P3-2の責務）。
- **Evidence Model**: 不可変証跡モデルは含まない（P2-4の責務）。
- **Report Generation**: 完了報告モデルは含まない（P2-5の責務）。
- **Performance Evaluation / Learning**: 社員の評価、学習・自己改善ロジックは含まない。
