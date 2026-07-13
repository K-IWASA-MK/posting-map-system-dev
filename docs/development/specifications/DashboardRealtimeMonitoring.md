# Dashboard Real-time Monitoring Specification (DashboardRealtimeMonitoring.md)

## 1. リアルタイムオブザーバー基本アーキテクチャ
AIOS Dashboard は、Kernel Runtime で発生する各種状態変化（イベント）を遅延なく安全に観測するため、一方向通信の **Server-Sent Events (SSE)** を採用したイベント駆動型アーキテクチャを敷設する。
クライアント（ダッシュボード）からカーネルへの書き込み操作やコマンド要求は一切送信せず、Observer 境界（Read Only）を完全に死守する。

---

## 2. 状態遷移と Polling Fallback コントローラー (State Machine)
リアルタイム接続とバックアップポーリングは、協調状態マシン（State Machine）として動作し、以下の4状態を遷移する。

```
       [初期化 / 起動]
              │
              ▼
   ┌──────────────────────┐
   │ REALTIME_CONNECTED   │◄───────────────────────┐
   └──────────┬───────────┘                        │
              │ (切断 / タイムアウト)               │
              ▼                                    │
   ┌──────────────────────┐ (再接続成功)           │
   │ REALTIME_DEGRADED    ├────────────────────────┤
   └──────────┬───────────┘                        │
              │ (再接続限界到達 / 5往復失敗)        │
              ▼                                    │
   ┌──────────────────────┐ (ストリーム再接続検知) │
   │ POLLING_BACKUP       ├────────────────────────┘
   └──────────────────────┘
              ▲
              │ (自動ポーリングフェイル)
   ┌──────────┴───────────┐
   │  (POLLING_BACKOFF)   │
   └──────────────────────┘
```

- **REALTIME_CONNECTED**: SSE が正常に接続され、ハートビートを定期検出している状態。定時ポーリングは完全停止。
- **REALTIME_DEGRADED**: 一時的な接続瞬断が発生し、指数バックオフを伴う再接続プロセスが動いている状態。
- **POLLING_BACKUP**: 再接続に連続して失敗し（例: 5回リトライ限界到達）、監視を維持するために定時ポーリング（10秒）を起動している状態。
- **REALTIME_RECOVERED**: ポーリングバックアップ稼働中に SSE 接続が復元し、状態を再度 `REALTIME_CONNECTED` に戻し、ポーリングを停止させた状態。

---

## 3. Event Stream ライフサイクル
1. **確立 (Connection Establish)**: ページロード時に `DashboardRealtimeClient` が接続先エンドポイント（`CONFIG.REALTIME_ENDPOINT`）に SSE 要求を発行。
2. **監視 (Monitoring & Heartbeat)**: サーバーから定期的に空のハートビートイベント（`type: "HEARTBEAT"`）を受信し、生生存期間を 15 秒で評価（無通信時は切断とみなす）。
3. **切断 (Disconnect / Reconnect)**: 例外検知時にソケットを明示的にクリアし、再接続状態（`REALTIME_DEGRADED`）へ遷移。
4. **終了 (Termination)**: タブ閉鎖またはアンロード時に `close()` を呼んでストリームを安全に破棄する。
