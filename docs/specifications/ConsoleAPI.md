# Console API 仕様書 (Console API)

## 概要
本仕様書は、Console Runtime が外部の管理コンソールや監視エージェント向けに提供する、読み取り専用の公開 API インターフェースの仕様を定義します。

## 設計方針
- **完全読み取り専用 (Strictly Read-Only)**:
  - 提供されるメソッドおよびエンドポイントは `GET` または `QUERY` 等の副作用を伴わない（Idempotent な）読み取り操作のみで構成されます。状態の変更、プロセスの制御、設定値の動的書き換えを行うAPIは一切禁止されます。
- **データ不変性保証 (Immutability Guarantee)**:
  - 各 API の戻り値として返却される JSON データは、すべて呼び出し時点でのスナップショットデータであり、メモリ上の状態と完全に切り離された複製（Deep Clone）です。

---

## 公開 API コントラクト (Public API Contract)

### 1. `GetRuntimeStatus`
- **概要**: プラットフォームのアクティブ状態および基本識別情報の取得。
- **メソッド**: `GET`
- **エンドポイント**: `/console/runtime-status`
- **レスポンススキーマ**:
  ```json
  {
    "status": "ACTIVE | SUSPENDED",
    "version": "string",
    "uptimeSeconds": 0,
    "activeCapabilities": ["string"]
  }
  ```

### 2. `GetHealth`
- **概要**: コアシステムおよび登録されたランタイムの健全性ステータスの取得。
- **メソッド**: `GET`
- **エンドポイント**: `/console/health`
- **レスポンススキーマ**:
  ```json
  {
    "overallStatus": "OK | WARN | DEGRADED",
    "timestamp": "ISO-8601-String",
    "components": {
      "kernel": "OK",
      "eventBus": "OK",
      "ledger": "OK"
    }
  }
  ```

### 3. `GetMetrics`
- **概要**: 実行されたイベント数、エラー率、収集された各種カウンター指標の取得。
- **メソッド**: `GET`
- **エンドポイント**: `/console/metrics`
- **レスポンススキーマ**:
  ```json
  {
    "totalEvents": 0,
    "failedEvents": 0,
    "processingTimeAverageMs": 0.0,
    "timestamp": "ISO-8601-String"
  }
  ```

### 4. `GetProjection`
- **概要**: 実行元帳（Execution Ledger）から生成された最新の状態プロジェクションの取得。
- **メソッド**: `GET`
- **エンドポイント**: `/console/projection`
- **レスポンススキーマ**:
  ```json
  {
    "projectionId": "string",
    "lastEventSequence": 0,
    "data": {}
  }
  ```

### 5. `GetLedgerSummary`
- **概要**: 監査元帳のレコード件数および最新のイベント履歴のサマリー取得。
- **メソッド**: `GET`
- **エンドポイント**: `/console/ledger-summary`
- **レスポンススキーマ**:
  ```json
  {
    "totalRecords": 0,
    "lastSequence": 0,
    "recentEvents": [
      {
        "sequence": 0,
        "eventId": "string",
        "type": "string",
        "timestamp": "string"
      }
    ]
  }
  ```

### 6. `GetValidationSummary`
- **概要**: 品質ゲート（Quality Gate）およびプラットフォーム境界検証（Validation Runtime）の最新テスト結果サマリーの取得。
- **メソッド**: `GET`
- **エンドポイント**: `/console/validation-summary`
- **レスポンススキーマ**:
  ```json
  {
    "overallStatus": "PASS | WARNING | FAIL",
    "timestamp": "ISO-8601-String",
    "failedRulesCount": 0,
    "results": [
      {
        "validatorId": "string",
        "status": "PASS | WARNING | FAIL",
        "duration": 0
      }
    ]
  }
  ```
