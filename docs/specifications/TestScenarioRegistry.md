# テストシナリオレジストリ仕様書 (Test Scenario Registry Specification)

## 目的
ローカルシミュレーションテストにおいて自動実行される各テストシナリオの識別ID、検証対象、期待される最終合否結果（Expected Result）、およびバージョンメタデータを一元定義する。

---

## テストシナリオ登録一覧 (Registered Scenarios)

### 1. SCN-NORMAL-001 (Normal Flow)
- **タイプ**: 正常系接続テスト
- **対象カーネル**: `MockExecutionKernel` から `MockGovernanceKernel` までの直列パイプライン。
- **期待結果**: `Passed`
- **概要**: 接続スキーマの不整合がなく、ガバナンス認可（Bypass）が得られる正常な結合を確認する。

### 2. SCN-ERROR-001 (Error Flow)
- **タイプ**: 異常系改善ループテスト
- **対象カーネル**: `MockQualityKernel` -> `MockSelfReviewKernel` -> `MockSelfImprovementKernel`
- **期待結果**: `Failed`（品質スコア不足による早期終了と改善移行の完了）
- **概要**: 品質不充足時に自律改善ループへ正しくフォールバックし、失敗が監査に記録されることを確認する。

### 3. SCN-APPROVAL-001 (Approval Flow)
- **タイプ**: 承認ゲート保留テスト
- **対象カーネル**: `MockOptimizationKernel` -> `MockGovernanceKernel`
- **期待結果**: `Passed`（模擬承認解決後の正常終了）
- **概要**: 重大アクション検知時の保留状態（Pending）への遷移と、模擬承認（Approved）後の続行を確認する。

### 4. SCN-CONTRACT-FAIL-001 (Contract Failure)
- **タイプ**: 接続契約違反テスト
- **対象接続点**: `Execution->Review`
- **期待結果**: `Failed`（必須フィールド欠落検知）
- **概要**: 接続スキーマ定義で要求される必須キー（`compiledFiles`）の欠損が、バリデーターによって正しくエラーとして検出され、処理が遮断されることを確認する。

### 5. SCN-BILLING-ISOLATION-001 (Billing Isolation)
- **タイプ**: 課金隔離境界テスト
- **対象カーネル**: `MockBillingKernel`
- **期待結果**: `Failed`（模擬支払失敗イベントによるエラー）
- **概要**: ダミーの決済Webhookイベントを正しく受信でき、かつStripe等の実サービスへのリクエストが生じない論理隔離を確認する。

---

## レジストリスキーマ (Registry Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TestScenarioRegistryRecord",
  "type": "object",
  "properties": {
    "scenarioId": { "type": "string" },
    "scenarioType": { "type": "string" },
    "expectedResult": {
      "type": "string",
      "enum": ["Passed", "Failed"]
    },
    "targetLayer": { "type": "string" },
    "version": { "type": "string", "default": "v1.0.0" }
  },
  "required": ["scenarioId", "scenarioType", "expectedResult", "targetLayer", "version"]
}
```
