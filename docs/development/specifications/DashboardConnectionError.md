# ダッシュボード接続エラー仕様書 (Dashboard Connection Error Specification)

## 目的
API 接続の失敗（通信断、応答タイムアウト）、JSON 構文破損、必須キー欠損が発生した場合のダッシュボードのエラーハンドリング、状態遷移、およびフォールバック（Fallback）挙動を規定する。

---

## 異常ケースと対応挙動 (Error Cases & Fallback)

### 1. 通信タイムアウト (API Timeout)
- **原因**: GAS API が 5000ms 以内に応答を完了しない場合。
- **挙動**: リクエストを中止し、UI 状態を `OFFLINE` または `WARNING` に変更。ローカルの Mock データを代替表示（Fallback）して描画を維持し、画面がブランク（白画面）になるのを完全に防ぐ。

### 2. JSON 構文破損 (Invalid JSON)
- **原因**: サーバー応答が JSON として不正である（HTML エラーページが返された等）場合。
- **挙動**: パース処理でのクラッシュを例外キャッチし、ログに警告出力の上、Mock データへ自動フォールバック。UI 状態を `WARNING` に変更。

### 3. スキーマ項目欠損 (Required Schema Missing)
- **原因**: 必須パラメータ（例: `qualityScore`）が JSON に含まれていない場合。
- **挙動**: スキーマ検証（Schema Validation）により欠損を検知。状態を `WARNING` に変更し、不足項目に対してローカルデフォルト値を補完した上で描画する。
