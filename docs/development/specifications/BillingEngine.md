# 課金エンジン仕様書 (Billing Engine Specification)

## 設計思想 (Philosophy)
> 課金エンジンは「決済を実行するエンジン」ではない。
> 外部の決済代行サービス（Stripe等）から受信した結果を処理し、AIOS内部の「契約（Subscription）」および「利用権利（License）」の状態管理と同期に特化した、安全な「契約・権利・状態管理レイヤー」である。

---

## 目的
AIOS（品質保証オペレーティングシステム）において、テナントやブランチごとの契約状況、支払いステータス、ライセンスの有効期間を決定論的に管理・記録し、不正利用防止および契約違反監査を行うための「課金・権利管理基盤（Billing & License Foundation）」を定義する。

---

## 責務
- 契約状態（Subscription）および利用ライセンス（License）のアクティブ/非アクティブ状態管理。
- 外部決済プロバイダーから通知された決済イベント（Payment Events）の正確な受信と、監査ログへの追記。
- 課金履歴（Billing History）の管理およびダッシュボード表示用データの出力。
- ガードレール：**AIによる自動決済実行、契約自動締結、自動返金、およびライセンスの直接変更は一切行わない（完全な非実行統制）。すべての変更・決済は人間（管理者）の直接操作または外部決済システムの自律通知のみを起点とする。**

---

## 契約・ライセンス処理フロー (Billing Flow)
本エンジンは以下の単方向フローによって外部イベントを状態データベースへ反映する。

```
[External Payment Event Webhook (Stripe等)]
                    │
                    ▼
[External Payment Adapter (外部アダプター)]
                    │
                    ▼
[Billing Engine (課金・権利管理)] ──(状態更新)──> [License Database (権利情報)]
                    │
                    ▼
[Billing Audit Log (追記のみ監査ログ)]
```

---

## CLI Orchestrator に対する接続・操作制限 (CLI Integration & Restriction)
課金エンジンは、外部のCLIOrchestratorからの呼び出し接続に対して、以下の通り厳格なアクセス制限を設ける。

- **操作の禁止 (No Write Actions via CLI)**:
  - CLIOrchestrator経由で、直接ライセンスのアクティブ化、有効期限の変更、サブスクリプションの解約、または決済テストの強制実行（Payment Trigger）などの書き込み・変更操作（Write Actions）を実行することをシステムレベルで完全に禁止する。
- **参照のみの許可 (Read-Only Status Query)**:
  - CLIからは、現在のライセンスステータス（Active / Suspended / Expired）や次回更新予定日の「状態参照（Read-Only Query）」のみが許可される。

---

## 統合シミュレーションに対する論理隔離 (Simulation Isolation Guardrail)
課金エンジンは、シミュレーション環境（Mock Layer）での接続検証処理から本番の決済情報・契約ライセンスを保護するため、以下の論理隔離境界を維持する。

- **模擬決済イベント生成の許可 (Mock Events Only)**:
  - `IntegrationSimulation` 内の検証に限り、ダミーの決済イベント（Payment Event Mock）をメモリ上で生成して受け取ることを許可する。
- **実決済およびライセンス変更の完全禁止**:
  - シミュレーション内でどのような模擬決済（支払成功・失敗など）や解約がシミュレートされたとしても、それが本番のサブスクリプション状態（Subscription）を書き換えたり、Stripe等の外部決済サービスへの実リクエストを発行したりすることはシステムレベルで完全に遮断される。

---

## 将来拡張ポイント (Future Extensions)
- **ライセンス自動停止連動 (Access-Control Automated Suspend)**:
  未払い等の警告（Past Due）状態が一定期間（例: 14日間）継続した場合、人間工学や品質スコア、ダッシュボード等へのアクセス権限を自動的に制限する認可制御（Access Control）との統合。
