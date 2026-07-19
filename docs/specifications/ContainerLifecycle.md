# Container Lifecycle (コンテナ・ライフサイクル仕様書)

## 概要
コンテナは、作成されてから終了・破棄されるまでに一方向的かつ決定論的なライフサイクルステータスを遷移します。

## 状態遷移定義
- **CREATED**: コンテナオブジェクト定義作成完了。
- **PREPARING**: ボリューム確保、ネットワーク設定など起動準備中。
- **STARTING**: サンドボックス隔離バインドおよびエントリポイント起動直前。
- **RUNNING**: プロセス起動完了し、稼働状態。
- **PAUSED**: 一時停止状態（CPU割り当て一時停止）。
- **STOPPING**: 終了シグナル送信中。
- **STOPPED**: プロセス終了完了。
- **TERMINATED**: リソース開放完了、オブジェクト破棄状態。

```text
CREATED ➔ PREPARING ➔ STARTING ➔ RUNNING ➔ STOPPING ➔ STOPPED ➔ TERMINATED
                                   │▲
                                   ▼│
                                 PAUSED
```
