# 模擬カーネルモデル仕様書 (Mock Kernel Model Specification)

## 目的
AIOS（品質保証オペレーティングシステム）のシミュレーション環境において、実データや外部リソースに依存せず、決定論的に動作して模擬応答を返すための「模擬カーネルエンジン（Mock Kernel Engines）」の入出力インターフェースおよび状態制御モデルを規定する。

---

## 模擬対象および定義 (Mock Models)
シミュレーションで使用する各モックエンジンは、以下の I/O および状態メタデータに基づいて設計される。

### 1. Mock Execution / Mock Review / Mock Quality
- **Mock Execution**:
  - **Input**: 擬似的なコード変更差分 (Mock Diff)。
  - **Output**: 模擬コンパイル結果。
  - **State**: `Success` / `SyntaxError` (模擬的文法エラー発生制御)。
- **Mock Review**:
  - **Input**: 模擬コンパイル結果。
  - **Output**: 模擬的な監査違反件数および AI Smell レベル。
  - **State**: `Normal` / `AI_Smell_Detected` (早期終了テスト用)。
- **Mock Quality**:
  - **Input**: 各個別レビュー判定。
  - **Output**: 模擬 `QualityScore` JSON。
  - **State**: スコア値の変更閾値（例: `72 / 100` 等）。

### 2. Mock Learning / Mock Optimization
- **Mock Learning**:
  - **Input**: 改善履歴と品質差分 (Delta)。
  - **Output**: 新規ナレッジ追加要求および推薦モデルのモック。
- **Mock Optimization**:
  - **Input**: ナレッジデータベース。
  - **Output**: 健康度内訳、統合推奨リスト、Gap領域を含む模擬 `Optimization Report`。

### 3. Mock Governance / Mock Billing
- **Mock Governance**:
  - **Input**: 最適化レポートおよびライセンス情報。
  - **Output**: `Pending` 保留要求、または `Bypassed` 実行認可。
  - **State**: 人間による模擬承認判定（`MockApproved` / `MockRejected`）。
- **Mock Billing**:
  - **Input**: Webhookイベントまたは顧客ID。
  - **Output**: 模擬 `LicenseRecord` および `SubscriptionRecord`。
  - **State**: `Trial` / `Active` / `Past Due` / `Cancelled` の模擬遷移設定。

---

## 模擬エンジン状態制御構造 (Mock Model Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MockKernelConfig",
  "type": "object",
  "properties": {
    "engineName": { "type": "string" },
    "expectedBehavior": {
      "type": "string",
      "enum": ["ReturnSuccess", "ThrowError", "TriggerTimeout", "EscalateToGate"]
    },
    "mockOutputPayload": { "type": "object" },
    "simulatedErrorCode": { "type": "string", "default": "" }
  },
  "required": ["engineName", "expectedBehavior", "mockOutputPayload"]
}
```
