# API 接続仕様書 (Dashboard API Connection Specification)

## 概要 (Overview)
本仕様書は、AIOS Dashboard が GAS KPI Provider から実際のカーネル Output を非同期取得する際の接続クライアントの要件、および GET Only 設計境界を規定する。

---

## 接続境界と GET Only 設計 (API Connection Constraints)
- **GET メソッドの絶対遵守**:
  - クライアント（`DashboardAPIClient.js`）は、データ取得リクエストに `GET` 以外のメソッド（`POST`, `PUT`, `PATCH`, `DELETE`）を使用することを厳格に禁止する。
  - 本番データベースの更新や、Stripe 契約の操作、Kernel 実行トリガーをダッシュボード経由で叩く機能は一切排除されなければならない。
- **通信モデル**:
  - `GET /api/dashboard/summary` エンドポイントに対し、非同期（Async/Await）でリクエストを発行する。

---

## タイムアウトおよびエラー処理戦略 (Timeout & Timeout Strategy)
- **Timeout 制限**:
  - ネットワーク遅延や GAS 側の高負荷に応答するため、最大 `5000ms` の Timeout リミットを設定する。
  - `AbortController` を使用してタイムアウト発生時に自動的に接続を切断し、呼び出し元へ通信切断（Offline）エラーを返す。
- **データ回復性 (Fallback)**:
  - 接続切断、またはエラーコード受信時は、画面をクラッシュさせずに警告バッジ（`OFFLINE` / `WARNING`）を点灯した上で、ローカルの代替モックデータを自動表示する。
