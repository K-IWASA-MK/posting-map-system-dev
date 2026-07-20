# AIOS Agent Scheduler Specification (Sprint G7-8)

本稿は、AIOS Generation 7 ランタイムレイヤーにおける「時間的実行計画層（Agent Scheduler）」の設計仕様書です。本コンポーネントの完成をもって、Generation 7 の全7層スタックが完成します。

---

## 1. 役割と責務 (Role & Responsibility)
1. **実行計画生成器 (Execution Plan Determiner)**:
   配信結果（`DeliveryResult`）に基づき、実行予定ID（`requestId`）、再試行方針、および同時実行数制御（スロットリング）を束ねた不変の実行計画書（`ScheduleResult`）を調定・返却します。
2. **実行スレッド・ワーカーの完全な非内包**:
   実スレッドのタイマー起動、非同期スリープ（`setTimeout` 等による待機）、および実際の処理を実行するワーカー（Worker）の機能は一切含みません。これらは `Generation 8` で実装される実行エンジン層へ委委譲します。
3. **ステートレスな計画生成 (Stateless Scheduling)**:
   スケジューラ自身は実行待ちキューや処理履歴などの状態をインメモリ/ファイルともに保持しないステートレス設計（Contract-02）を貫徹し、純粋関数として決定論的な計画解決を行います。

---

## 2. スケジューリングフロー (Scheduling Flow)

```
             DeliveryResult (delivered)
                        │
                        ▼
           [ AgentScheduler.ts ]
                        │
        [ Validate Delivery Invariant ] ──> 未達メッセージは却下
                        │
                        ▼
       [ Resolve Static Policies Mapping ] ──> Retry / Throttle ID 決定
                        │
                        ▼
       [ Build ScheduleRequest.ts ]
                        │
                        ▼
       [ Build ScheduleResult.ts ]
                        │
                        ▼
                 ScheduleResult
                        │
                        ▼
          Execution Worker (G8 Layer)
```

---

## 3. 将来的な設計拡張ポイント (Architecture Extensibility)

* **ポリシーレジストリ（`PolicyRegistry`）との統合**:
   現在は、簡易実装として `"RETRY-POLICY-DEFAULT"` および `"THROTTLE-POLICY-DEFAULT"` の固定文字列IDを返却していますが、Generation 8 以降では個別ポリシーを解決するための `PolicyRegistry` から動的解決するインターフェースへ容易に差し替え可能です。
* **優先度（Priority）モデルの高度化**:
   `priority` パラメータは文字列（`string`）として受け入れられますが、将来的に `LOW`, `NORMAL`, `HIGH`, `CRITICAL` などの順序決定論ロジックや、独立した優先度評価ポリシーをバインドするための拡張スロットを想定しています。
* **再試行ストラテジー（`strategy`）の拡張**:
   `RetryPolicy` に対して、指数バックオフ（`EXPONENTIAL_BACKOFF`）、線形遅延（`LINEAR`）、固定間隔（`FIXED`）、なし（`NONE`）などの再試行遅延計算ロジック（`strategy` フィールド）を定義し、高度な障害復旧プランを記述できるよう拡張余地を残しています。
