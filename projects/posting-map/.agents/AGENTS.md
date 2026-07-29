# Google Apps Script (GAS) Deployment SOP

GASのコード変更後、以下の確認を必須とする。これを怠ると、クライアント（実機）が古いデプロイを参照し続け、デバッグが無限ループに陥る原因となる。

## GAS変更時 必須確認リスト
- [ ] `clasp push` 済みであること
- [ ] `clasp deploy` またはデプロイメントが完了していること
- [ ] Web App URL が更新されていること（デプロイメントIDの変更有無の確認）
- [ ] `config.js` （各種クライアント用設定ファイル）内の `gasWebAppUrl` が同期（最新のURLへ更新）済みであること
- [ ] 実機接続先が更新された新しいエンドポイントを向いているか確認済みであること

## 🛡️ 起動時非再帰ルール (No Recursive Startup Rule)

アプリ起動処理（Startup Runtime: LIFF初期化から Dashboard Ready / ID表示完了まで）における循環参照や排他デッドロックを防止するため、以下の実装規則を厳守すること。

* **`loadData()` の再帰呼び出し禁止**:
  * `loadData()` の内部、および `loadData()` から呼び出されるすべての下流関数（例: `syncOfflineQueue()`, `triggerBackgroundRegistration()` 等）の内部から、`loadData()` を直接・間接的に再呼び出し（再帰）してはならない。
  * データの更新通知や再フェッチを行う場合は、呼び出し元の処理フローが完全に完了し、スタックを抜けた後にイベント駆動でトリガーするか、あるいは最初から同期呼び出しをせずバックグラウンド並行タスクとして分離すること。
