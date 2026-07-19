# Alert Model 仕様書

## 概要
本仕様書は、テレメトリレコードから動的にルール評価を行い、異常状態を検出して通知するアラートモデルを定義します。

## 重要度定義 (Alert Severity)
- **INFO**: 一般情報（例: 設定更新、低優先イベント）
- **WARNING**: 注意（例: 応答速度遅延、一時的な接続タイムアウト）
- **ERROR**: 軽度障害（例: 検証失敗、特定リクエストのエラー）
- **CRITICAL**: 致命的障害（例: ランタイムクラッシュ、セキュリティ違反）

## アラートルール契約 (AlertRule Contract)
```typescript
export interface AlertRule {
  readonly ruleId: string;
  readonly condition: (record: ObservabilityRecord) => boolean;
  readonly severity: AlertSeverity;
  readonly action?: string; // 将来 Automation Runtime で自動実行されるアクション名
  readonly cooldown: number; // 同一ルールの重複発生を防ぐCooldown期間（ミリ秒）
  readonly enabled: boolean;
}
```
