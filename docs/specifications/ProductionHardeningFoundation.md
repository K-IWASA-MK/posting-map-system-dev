# Production Hardening Foundation Specification (本番堅牢化基盤仕様書)

## 1. Pipeline Execution Flow (実行保護パイプライン)
本堅牢化基盤は、バリデーションやルーティング実行よりも前段（API のエントリーポイント直下）に配置され、過剰な負荷や設定不備、およびシステム障害からシステムを守るセキュリティガードおよび回路保護層（Circuit Breaker）を提供します。

```
[HTTP Request]
     │
     ▼
[HardeningPipeline.execute]
     ├──► [ReadinessValidator] (起動可能状態検査)
     ├──► [CircuitBreakerFoundation] (サーキット開閉状態判定: OPEN時は503遮断)
     ├──► [RequestGuard] (リクエストサイズ・引数個数超過検査: 超過時は413/400遮断)
     └──► [ResourceGuard] (実行メモリ・合計時間保護設定)
     │
     ▼ (Clearance)
[ValidationPipeline.validate] ──► [ApiRouter.route]
```

---

## 2. Hardening Guard Result (保護判定定義)
リクエストガードやリソースガード、サーキットブレーカーの判定結果は、将来的な判定ポリシー拡張を意識して `GuardResult` オブジェクトを返却する設計とします。

```typescript
export interface GuardResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly status?: number; // 例: 413, 400, 503
}
```

---

## 3. Circuit Breaker States (サーキットブレーカー状態管理)
インメモリで以下の状態遷移を制御します。サーキットが `OPEN` に遷移した際には、そのトリガーとなった要因を示す `CircuitReason`（`TIMEOUT`, `CONFIG`, `RESOURCE` 等）を理由として保存します。

* **`CLOSED`**: 通常稼働状態。すべてのリクエストを通します。
* **`OPEN`**: 障害発生時の遮断状態。リクエストをハンドラーに渡さず、即座に HTTP 503 エラーを返却します。
* **`HALF_OPEN`**: 一部テストリクエストを通し、復旧を確認する試行状態。

---

## 4. Component Health Diagnostics (ヘルスチェック)
`HealthCheckService` は以下の識別子（Component ID）を用いて個別に稼働状態を監視します。
* `CONFIG`: `GasConfigurationProvider` 設定値読み込み状態
* `REPOSITORY`: `SpreadsheetRepository` 接続状態
* `CACHE`: `CacheServiceProvider` 稼働状態
* `LOCK`: `LockServiceProvider` ロック取得検証
* `MONITOR`: `MonitoringPipeline` イベントディスパッチ診断
* `ROUTER`: `ApiRouter` エンドポイント登録状態
