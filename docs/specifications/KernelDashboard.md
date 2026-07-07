# カーネルダッシュボード仕様書 (Kernel Dashboard Specification)

## 設計思想 (Philosophy)
> ダッシュボードは実行（Execution）や意思決定（Decision）の責務を持たない。
> AIOS Kernel の各レイヤー（Execution, Review, Quality, Self Review, Self Improvement, Learning, Optimization, Governance）の
> 稼働ステータスや実績メトリクスを横断的に観測・可視化することに特化した、純粋な「表示・観測専用レイヤー（Observer Layer）」である。

---

## 目的
AIOS（品質保証オペレーティングシステム）において、各カーネルレイヤーの実行結果、品質スコア、蓄積ナレッジの健康度、承認待ち状況、および監査ログを人間（管理者）がリアルタイムに俯瞰確認するための「可視化基盤（Dashboard Foundation）」を定義する。

---

## 責務
- 各カーネルモジュールからイベントやデータファイル（JSON）として出力される状態・指標データを収集（Status Tracking）。
- 収集したデータを再計算・加工せず、定義されたUIコンポーネントを用いて人間が理解しやすい形に可視化（Visualization）。
- 承認待ち要求（Pending Approval）のリストアップと、管理者への通知表示（Bypass不可）。
- ガードレール：**ダッシュボード内からのルール変更、承認実行、ナレッジ編集、およびパイプライン制御などの変更アクションは一切行えない（Read-Only）。**

---

## 観測モデル (Observer Pattern)
ダッシュボードは、以下の通り AIOS Kernel 各レイヤーの状態と疎結合に通信し、一方向（データソースからダッシュボードへ）のみのデータ伝播を保障する。

```
[AIOS Kernel Layer (データソース)]
           │
           ├─(状態イベント発報 / JSON出力)
           ▼
[Observer Agent (状態監視部)] ──> [UI描画 (Visualization)] ──> [人間 (管理者)]
```

### データソース (Data Sources)
ダッシュボードが表示するデータのソースは以下の定義済み出力に限定し、ダッシュボード内での再計算（品質スコアや健康度の独自再計算など）は行わない。
- **カーネル状態**: `KernelStatus.md` に定義される各レイヤーのアクティブ状態。
- **品質情報**: `QualityScore` レイヤーが出力するスコア JSON。
- **ナレッジ情報**: `KnowledgeOptimization` レイヤーが出力する `Optimization Report` (Health/Merge/Gap/Metrics)。
- **ガバナンス情報**: `Governance` レイヤーが出力する `Governance Decision` & `Governance Audit`。
- **課金・ライセンス情報**: `Billing` & `License` レイヤーから出力される `LicenseRecord` および `SubscriptionRecord` の不変情報。
- **CLI実行・オーケストレーション情報**: `CLIOrchestrator` レイヤーから出力される `RunContext` および `CLIAuditRecord` の実行履歴。

### 課金・ライセンス表示項目 (Billing & License Mappings)
ダッシュボード上に「ライセンス・お支払い状況監視パネル」を表示する。表示項目はすべて読み取り専用（Read-Only）とし、契約変更や決済実行ボタンは一切排除する。
- **License Status**: ライセンスの有効期限および現在の状態（Active / Suspended 等）。
- **Subscription Status**: 次回請求更新予定日およびサブスクリプションの状態（Trial / Active / Past Due 等）。
- **Billing History**: 過去の `PaymentEvent`（決済履歴）の一覧表示。

### CLI 実行状況表示項目 (CLI Run Status Mappings)
ダッシュボード上に「CLI実行・オーケストレーション監視パネル」を表示する。表示項目はすべて読み取り専用（Read-Only）とし、ダッシュボード内からのコマンドの再実行や中断操作ボタンは一切排除する。
- **Run Status**: 現在実行中の `Run ID`、処理進捗状況（ステータスが Running / Completed / Failed 等）、および実行ユーザー。
- **Command Status**: 現在起動しているコマンド名（例: `run-pipeline`）および呼び出し引数。
- **Error Status**: 実行に失敗したタスクのエラーコード、エラーメッセージ、および発生日時。

---

## 将来拡張ポイント (Future Extensions)
- **マルチテナント統合監視 (Multi-Tenant Global Dashboard)**:
  複数の支部（例: MIE-03, TOKYO-01）の各 AIOS インスタンスから最適化およびガバナンスメトリクスを集約し、企業・本部レベルで全体の稼働健全度やルール不適合率を比較・統制するグローバル監視ビューの追加。
