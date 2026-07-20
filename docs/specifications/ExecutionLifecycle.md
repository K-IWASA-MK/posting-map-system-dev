# AIOS Execution Lifecycle Specification (Sprint G8-8)

本稿は、AIOS Generation 8 実行環境における最終統合レイヤー「Execution Lifecycle（実行ライフサイクル）」の設計仕様書です。本コンポーネントは、Execution Lifecycle Layer として動作し、これまで構築した実行環境スタック（G8-1〜G8-7）を統一されたライフサイクルモデルへ接続する契約（Lifecycle Contract）を提供します。

---

## 1. Execution Lifecycle Architecture

Execution Lifecycle は、下位の観測指標層である `RuntimeMetricsResponse`（G8-7）を入力として受け取り、実行パイプライン全体のライフサイクル状態、および進捗ステージを表現する不変モデル（`ExecutionLifecycleResponse`）を構築する最終レイヤーです。

```
Execution Runtime (G8-2)
        │
Agent Orchestrator (G8-3)
        │
Execution Context (G8-4)
        │
Execution Pipeline (G8-5)
        │
Execution Result (G8-6)
        │
Runtime Metrics (G8-7)
        │
        ▼
[ ExecutionLifecycleRequest ]
        │
        ▼
   ExecutionLifecycleProvider (Lifecycle Layer)
        │
        ├── Validate Lifecycle Request
        ├── Resolve Lifecycle State (Lifecycle State & Transition Contract)
        ├── Build Lifecycle Stage Model
        └── Produce Lifecycle Response
        │
        ▼
[ ExecutionLifecycleResponse ]
```

---

## 2. Lifecycle Resolution Flow

1. **Request Intake & Validation**:
   `ExecutionLifecycleRequest` を受け取り、内包される `RuntimeMetricsResponse` の整合性を検証します（空のIDチェック等）。
2. **Lifecycle State & Stage Resolution**:
   入力された実行メトリクス（成功ステータス、完了/総ステージ数など）を基に、ライフサイクルの状態判定および現在の進捗ステージを解決します。
3. **ExecutionLifecycleState & Stage Build**:
   解決されたライフサイクル識別IDとステータスをバインドした `ExecutionLifecycleState`、およびステージの現在値/候補値をバインドした `ExecutionLifecycleStage` をそれぞれ不変モデルとして組み立てます。
4. **Response Packaging**:
   作成したステートとステージを `ExecutionLifecycleResponse` としてラップし、システム全体に提供します。

---

## 3. Runtime Contracts (実行時契約)

* **Contract-01: Immutable Models**: 
  `ExecutionLifecycleState`, `ExecutionLifecycleStage`, `ExecutionLifecycleRequest`, `ExecutionLifecycleResponse` のすべてのプロパティは `readonly` とします。
* **Contract-02: Stateless Provider**:
  ExecutionLifecycleProvider は内部状態、キャッシュ、セッション、履歴DBを保持しない純粋関数的な動作を行います。
* **Contract-03: Deterministic Lifecycle Resolution**:
  同一の `RuntimeMetricsResponse` 入力に対しては、常に全く同一の `ExecutionLifecycleResponse` が決定論的に生成されることをアサーション契約とします。
* **Contract-04: No Lifecycle Management**:
  Execution Lifecycle はライフサイクル状態の構造および表現モデルのみを担当し、実際の状態遷移機械の稼働（イベント駆動型の遷移処理、タイマーのハンドリング等）、イベント通知のディスパッチ、スケジューリング、およびプロセス実行制御自体は行いません。
* **Contract-05: No Persistence**:
  履歴・状態・キャッシュの永続化は行いません。
* **Lifecycle Contract (ライフサイクル契約)**:
  `ExecutionLifecycleProvider` は Lifecycle Contract（Lifecycle State & Transition Contract）を提供します。ただし、本スプリントではモデルおよび契約の定義のみを行い、実際の状態遷移アルゴリズム、イベントディスパッチ、スケジューリング、および制御ロジックは後続の世代で実装します。

---

## 4. 将来的な設計拡張ポイント (Architecture Extensibility)

* **`ExecutionLifecycleState` のプロパティ拡張**:
  現在は最低限の識別IDとステータスのみですが、将来的な拡張として以下のような実行ライフサイクルメタデータを追加できるように拡張スロットが設計されています。
  - `lifecycleVersion`: ライフサイクル定義のスキーマバージョン。
  - `lifecycleTimestamp`: 状態が更新（解決）された時刻の記録。
  - `transitionId`: 一意な遷移処理識別ID（ステートマシン遷移履歴用）。
  - `correlationId`: 分散トレーシング用の相関コンテキストID。
* **`ExecutionLifecycleStage` の将来拡張**:
  進捗状況をきめ細かく調停・制御するため、以下のプロパティ追加を想定して定義されています。
  - `previousStage`: 直前に実行されていたステージの名前。
  - `nextStageCandidates`: 次に遷移可能なターゲットステージのリスト。
  - `terminalStage`: この実行パイプラインにおける終端ステージの定義。
  - `stageCategory`: ステージの分類カテゴリ（`planning`, `running`, `cleanup` 等）。
* **Lifecycle Metadata (メタデータマッピング)**:
  実行時の環境変数、クライアント識別情報（`MIE-03` 等のライセンスID）、および優先度パラメータを付与し、ライフサイクル監視時に実行元のコンテキストを迅速に解析できるようにするメタデータ拡張。
* **Transition Policies (遷移ポリシー)**:
  特定のステージから次のステージへ遷移する際の条件（リトライ上限、特定エラーの例外ハンドリングポリシー、承認要求の有無など）を動的に制御するポリシーのバインドスロット。
* **Lifecycle Labels (ラベルタグ)**:
  デバッグ、ロギング、および可視化ダッシュボードでのグルーピング用として任意のキー・バリュー形式のメタタグをバインドするスロット。
* **Correlation Context (相関コンテキスト)**:
  非同期かつ分散した環境において、複数の Agent 実行チェーンやバックエンド GAS トランザクションを単一の実行フローとしてトレースおよび集約するための不変コンテキスト。
