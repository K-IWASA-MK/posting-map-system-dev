# Compliance Model 仕様書

## 概要
本仕様書は、適合性評価の結果、および違反状態の通知に使用されるコンプライアンス適合データモデルを定義します。

## 適合性結果モデル (ComplianceResult)
- `runtimeId`: 評価対象 Runtime
- `policyId`: 評価基準となった Policy Bundle のID
- `score`: 0〜100 の適合スコア
- `status`: 適合状態判定（`PASS`, `FAIL`, `WARNING`）
- `violations`: 検出された `ComplianceViolation` の配列
- `recommendations`: 推奨される是正処置のアクション/説明一覧

## 適合違反モデル (ComplianceViolation)
- `violationId`: 違反判定レコードの一意識別ID
- `policyId`: 違反した `PolicyDefinition` のID
- `severity`: 違反の重要度レベル（INFO, WARNING, ERROR, CRITICAL）
- `message`: 違反の具体的内容を示すメッセージ
- `recommendation`: 自動または手動の是正提案

## 適合レポート (ComplianceReport)
- `reportId`: レポートの一意ID
- `overallScore`: 全適合スコアの平均集計値
- `results`: 各 Runtime 別の `ComplianceResult` の配列
- `timestamp`: 評価監査完了のタイムスタンプ
