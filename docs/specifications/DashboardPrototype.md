# ダッシュボードプロトタイプ仕様書 (Dashboard Prototype Specification)

## 概要 (Overview)
本仕様書は、AIOS（品質保証オペレーティングシステム）の状態、メトリクス、および検証監査履歴を安全に視覚観測するための「Observer Dashboard UI」の骨格および設計要件を定義する。

---

## 観測専用設計 (Observer Design Constraints)
ダッシュボードは AIOS Kernel の「観測者（Observer）」としてのみ機能し、Kernel に対する制御・状態変更の能力を一切持たない。
- **操作インターフェースの排除**:
  - アクションを実行させるボタン（`Execute`, `Approve`, `Reject`, `Delete`, `Pay Now` 等）は画面から完全に排除される。
- **一方的なデータフロー**:
  - データは常に `Kernel -> Mock Data -> UI` の一方向のみに流れ、UI 側からの書き込みや要求変更は生じない。

---

## 隔離要件 (Backend Isolation & UI Boundary)
開発・検証環境において、本番システムや外部APIへの偶発的なアクセスを防ぐため、以下の論理隔離ルールを適用する。

1. **参照禁止項目 (Forbidden API / SDK)**:
   - JavaScriptコード内において、`SpreadsheetApp`, GAS API, Stripe SDK, 本番用 `db.js` ファイルへの import/require やアクセスは一切禁止される。
2. **モックデータ方針 (Mock Data Strategy)**:
   - プロトタイプ段階におけるすべての表示項目は、ローカルのモックJSONオブジェクトから非同期ロードして描画する。
3. **将来のバックエンド接続予定**:
   - 将来的に GAS 等のバックエンドに接続する際も、書き込み用 API は一切マッピングせず、読み取り専用の `getSummary()` 等の GET-JSON API のみと通信する設計とする。

---

## モーションレイヤーアーキテクチャ (Motion Layer Architecture)
ダッシュボード上に組み込まれるモーション演出は、データフローの最も下流に位置する「表示専用レイヤー」であり、判定ロジックや状態の判定を一切持たない。
- **データ駆動モーション**:
  - `MOCK_DASHBOARD_DATA` ロード完了 ──> HTML DOM 構築 ──> `DashboardMotion.js` 起動 ──> クラス付与 ──> CSS トランジション実行。
- **隔離と安全の保障**:
  - アニメーション処理から、状態を変更するための `updateKernel()`, `approve()`, `delete()` などのビジネスロジックは一切呼び出されない。

---

## リアルデータ観測アーキテクチャ (Live Data Observer Architecture)
ダッシュボードがモックから実 API データソース（`DATA_SOURCE = API`）へ切り替わった場合も、不変の Observer 性を維持するための設計構造。
- **データフローの順序保証**:
  - `GET /api/dashboard/summary` ──> `DashboardDataAdapter.js` による JSON 必須キーチェック ──> `Dashboard.js` への引き渡し ──> DOM レンダリング ──> `DashboardMotion.js` 起動。
- **書き込み処理の禁止**:
  - `DashboardDataAdapter` の定義内には、Stripe API、GAS への `POST`, `PUT`, `DELETE` リクエストや、Spreadsheet への直接アクセス機能は一切配置されない。
