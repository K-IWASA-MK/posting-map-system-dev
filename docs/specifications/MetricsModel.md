# Metrics Model 仕様書

## 概要
本仕様書は、AIOS プラットフォーム全体および各 Runtime で収集される標準的な統計・指標（Metrics）のデータモデルを定義します。

## 標準メトリクス (Standard Metrics)
1. **Runtime Count**: プラットフォームに登録されている Runtime の総件数。
2. **Runtime State**: 各 Runtime の現在の稼働状態（Ready, Running, Stopped, FAILED）。
3. **Runtime Health**: 各 Runtime の健全性（Healthy, Degraded, Unhealthy）。
4. **Event Throughput**: 単位時間あたり、または総累積ログ／スパンの処理スループット。
5. **Event Queue**: 処理待ちキューの滞留件数。
6. **Validation Count**: 境界検証の通算検証実行回数。
7. **Plugin Count**: ロード・実行されたプラグインの総数。
8. **Error Count / Warning Count**: エラー、警告ログの通算件数。
