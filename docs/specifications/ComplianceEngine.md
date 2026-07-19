# Compliance Engine 仕様書

## 概要
本仕様書は、アクティブなポリシー群に基づいて Runtime やプラグインの適合性を動的に監査・評価する「Compliance Engine」の仕様を定義します。

## 構成と責務
1. **適合性評価 (Compliance Evaluation)**:
   - 対象 Runtime または環境設定状態が、アクティブなポリシーに準拠しているか監査します。
2. **適合スコア算出**:
   - 各評価対象について適合率スコア（0〜100）を算定し、その全体の加重平均を `overallScore` として集計します。
3. **違反検出 (Violation Detected)**:
   - ポリシー準拠違反を検出した場合、重要度別（INFO, WARNING, ERROR, CRITICAL）の `ComplianceViolation` レコードを生成し、`ViolationDetected` イベントを配信して Automation Runtime の安全自己是正判定と連携します。
4. **イベント駆動出力**:
   - 適合監査完了時に `ComplianceEvaluated` イベントを発行し、品質監査ループへ結果を渡します。
