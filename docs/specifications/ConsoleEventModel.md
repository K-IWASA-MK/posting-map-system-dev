# Console イベントモデル仕様書 (Console Event Model)

## 概要
本仕様書は、Console Runtime の状態変化やライフサイクル遷移において発行・購読されるイベントのスキーマとメッセージ定義を規定します。

## イベントトポロジー
Console 関連イベントは、システム実行、品質状態、および監視モデルの変化を表すために `RuntimeEventBus` を介して流通します。

```
                    [ System Runtime / Validation Runtime ]
                                      |
                                      v (Event Publication)
                              [ RuntimeEventBus ]
                                      |
       +------------------------------+------------------------------+
       | (Console Control Events)                                    | (State Notification Events)
       v                                                             v
[ Console Runtime ]                                         [ Observability Subsystem ]
```

---

## 定義イベント一覧

### 1. ライフサイクルイベント (Lifecycle Events)

#### ConsoleInitialized
- **説明**: Console Runtime がロードされ、監視に必要なレジストリや設定の読み込みが正常に完了したことを通知します。
- **スキーマ**:
  ```json
  {
    "eventId": "EVT-CON-INIT-XXXXXX",
    "type": "ConsoleInitialized",
    "timestamp": "ISO-8601-String",
    "payload": {
      "consoleId": "string",
      "port": 0
    }
  }
  ```

#### ConsoleReady
- **説明**: すべてのイベントリスナー、メトリクス集計用サブスクライバーのバインドが完了し、監視可能になったことを通知します。
- **スキーマ**:
  ```json
  {
    "eventId": "EVT-CON-READY-XXXXXX",
    "type": "ConsoleReady",
    "timestamp": "ISO-8601-String",
    "payload": {
      "consoleId": "string",
      "status": "READY"
    }
  }
  ```

#### ConsoleStopped
- **説明**: HTTP API サーバーの終了、イベント購読解除など、Console Runtime の停止処理が正常完了したことを通知します。
- **スキーマ**:
  ```json
  {
    "eventId": "EVT-CON-STOP-XXXXXX",
    "type": "ConsoleStopped",
    "timestamp": "ISO-8601-String",
    "payload": {
      "consoleId": "string",
      "reason": "string"
    }
  }
  ```

---

### 2. 状態変化イベント (State Transition Events)

#### ConsoleRefreshRequested
- **説明**: 観測ビューモデルの手動リフレッシュや強制同期要求が発生したことを示します。
- **スキーマ**:
  ```json
  {
    "eventId": "EVT-CON-REFRESH-XXXXXX",
    "type": "ConsoleRefreshRequested",
    "timestamp": "ISO-8601-String",
    "payload": {
      "triggeredBy": "string"
    }
  }
  ```

#### ConsoleProjectionChanged
- **説明**: 元帳の更新に基づき、Console Registry 上のデータ射影（Projection）が最新状態に再構成されたことを通知します。
- **スキーマ**:
  ```json
  {
    "eventId": "EVT-CON-PROJ-XXXXXX",
    "type": "ConsoleProjectionChanged",
    "timestamp": "ISO-8601-String",
    "payload": {
      "projectionHash": "string",
      "lastEventSequence": 0
    }
  }
  ```

#### ConsoleMetricsUpdated
- **説明**: 処理件数、エラー率、リクエスト数などのシステム統計メトリクスが更新されたことを通知します。
- **スキーマ**:
  ```json
  {
    "eventId": "EVT-CON-METRICS-XXXXXX",
    "type": "ConsoleMetricsUpdated",
    "timestamp": "ISO-8601-String",
    "payload": {
      "collectedIntervalMs": 0,
      "metricsSummary": {
        "eventCount": 0,
        "errorCount": 0
      }
    }
  }
  ```

#### ConsoleValidationCompleted
- **説明**: `ValidationRuntime` において、プラットフォーム境界や命名規則の検証が完了したことを通知します。本イベントは、将来の Monitoring や Quality Runtime が購読して自動ガバナンス履歴を記録する為の接続ポイントになります。
- **スキーマ**:
  ```json
  {
    "eventId": "EVT-CON-VAL-XXXXXX",
    "type": "ConsoleValidationCompleted",
    "timestamp": "ISO-8601-String",
    "payload": {
      "runId": "string",
      "overallStatus": "PASS | WARNING | FAIL",
      "failedCount": 0,
      "warningCount": 0
    }
  }
  ```

#### ConsoleAuditUpdated
- **説明**: 監査情報またはアクセス元帳ログに新たなエントリが追記されたことを通知します。
- **スキーマ**:
  ```json
  {
    "eventId": "EVT-CON-AUDIT-XXXXXX",
    "type": "ConsoleAuditUpdated",
    "timestamp": "ISO-8601-String",
    "payload": {
      "logCount": 0,
      "lastLogSummary": "string"
    }
  }
  ```
