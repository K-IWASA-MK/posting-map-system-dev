# Monitoring & Audit Foundation Specification (モニタリング＆監査基盤仕様書)

## 1. Monitoring Flow (モニタリングフロー)
本アーキテクチャは、API のライフサイクル（リクエスト開始から終了、または例外発生による失敗まで）からイベントを収集し、リスナーへ安全に配信する可観測性（Observability）基盤です。

```
[doGet / doPost] ──► (Trigger stages) ──► [ApiLifecycleObserver]
                                                    │
                                                    ▼
                                           [MonitoringPipeline]
                                                    │
                                                    ▼ (Dispatch: sequenceNumber order)
                                            [EventDispatcher]
                                                    │
                                ┌───────────────────┴───────────────────┐
                                ▼                                       ▼
                         [AuditCollector]                       [MetricsCollector]
                  (Store in-memory AuditEvents)           (Store in-memory MetricsEvents)
```

---

## 2. Event Classification & Sequence Guarantee (イベント分類と順序保証)
イベントの順序性を厳密に検証するため、すべての `MonitoringEvent` は単調増加する `sequenceNumber` を有します。また、イベント種別は以下の 4 カテゴリに分類されます。

### Event Category (`EventCategory`)
* `AUDIT`: ユーザーの操作や実行ステップを示す監査ログイベント。
* `METRICS`: パフォーマンス、キャッシュ使用率などの統計用メトリクスイベント。
* `LIFECYCLE`: API の開始・終了を表すライフサイクルイベント。
* `EXCEPTION`: 実行時に発生したエラーやバリデーションエラーを示す例外イベント。

---

## 3. API Lifecycle Stages (API ライフサイクルステージ)
`ApiLifecycleObserver` により、以下の順序でライフサイクルが進行します。

1. **`REQUEST_STARTED`**: API 処理の開始を検知（Lifecycle/Audit イベント）。
2. **`VALIDATION_COMPLETED`**: バリデーションチェックをパスした段階。
3. **`ROUTING_COMPLETED`**: エンドポイントおよびハンドラー解決した段階。
4. **`HANDLER_COMPLETED`**: ハンドラーの業務処理（またはスタブ）実行が終わった段階。
5. **`REQUEST_COMPLETED`**: クライアントへレスポンスを返す直前（Lifecycle/Audit/Metrics イベント）。
6. **`REQUEST_FAILED`**: バリデーション失敗またはシステム例外発生時のエラー処理完了段階（Lifecycle/Audit/Exception/Metrics イベント）。
