# Automation Action 仕様書

## 概要
本仕様書は、自己規制プロトコルにおいて Automation Runtime が呼び出し可能な標準アクションの実行仕様を定義します。

## 標準アクション一覧 (Standard Actions)
1. **Validation 実行 (Validation)**:
   - システム境界、循環参照、コンパイル状態の自動再検証をキックします。
2. **Cache Cleanup (Cache Cleanup)**:
   - 肥大化したインメモリキャッシュおよび一時ファイルを消去し、メモリリークやデータ不整合をクリアします。
3. **Runtime Restart (Runtime Restart)**:
   - 異常状態に陥った Runtime またはスレッドを正常ブート状態に安全にリブートします。
4. **Plugin Reload (Plugin Reload)**:
   - サンドボックスのプラグイン環境をリセットし、セキュリティコンテキストをリロードします。
5. **Health Check (Health Check)**:
   - 各 Runtime に対して能動的にヘルスプローブを実行し、診断結果を収集します。
6. **Diagnostic Report (Diagnostic Report)**:
   - システムログ、スタックトレース、現在のメトリクスのダンプを含むレポートを作成します。
