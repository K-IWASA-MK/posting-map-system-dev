# GAS Production Foundation Specification (GAS 本番バックエンド高速化基盤仕様書)

## 1. Production API Architecture (本番APIアーキテクチャ)
本アーキテクチャは、ポスティング記録の整合性を守るための排他制御と、低遅延・高負荷に耐えうるキャッシュ構造を一貫して統合した、Google Apps Script (GAS) 本番用APIレイヤーです。

```
                    [Client (H-App / Dashboard)]
                                │
                                ▼ fetch(JSON)
                       [doGet() / doPost()]
                                │
                      [ApiExecutionContext] (Request ID & Time tracking)
                                │
                                ▼
                    [LockServiceProvider] (Script/Document Lock)
                                │
                                ▼
                   [CacheServiceProvider] (Deterministic cache read)
                                │
                 (Hit)          ├──────────────────────┐ (Miss)
           ┌────────────────────┘                      ▼
           │                                 [SpreadsheetRepository]
           │                                           │
           │                                   ┌───────┴───────┐
           │                                   ▼               ▼
           │                          [SpreadsheetBatchReader] [SpreadsheetBatchWriter]
           │                                   │               │
           │                                   └───────┬───────┘
           │                                           ▼
           │                                    [SpreadsheetApp] (SSOT)
           │                                           │ (Cache Write-through)
           │                                           ▼
           │                                 [CacheServiceProvider]
           ▼                                           │
     [JSON Response] ◄─────────────────────────────────┘
```

---

## 2. Configuration Management (設定取得の抽象化)
* **GasConfigurationProvider**:
  - 全ての設定パラメータ（Cache TTL, Lock Timeout, API Version, 機能フラグ等）を一括管理。
  - 将来的な `SecretProvider`（暗号化セキュアストレージ等）への差し替えに備え、PropertiesServiceへの直接依存を排除・カプセル化。

---

## 3. Deterministic Cache Policy (決定論的一方向キャッシュ)
* **データフロー**: `Spreadsheet (SSOT)` -> `CacheServiceProvider` -> `Response`
* **整合性規則**: 
  - キャッシュからスプレッドシートへの直接の書き戻しは例外なく禁止します。
  - 書き込み操作（`submitDistribution`, `updateFieldStatus` 等）が発生した場合は、スプレッドシートへの書き込み完了直後に、関連するキャッシュキーの明示的な無効化（`invalidate`）または最新データの即時書き出し（Write-through）を行います。
* **Cache Namespace**: キー衝突を避けるため、`tenantId:branchId:dataType` の構造で名前空間を分離します。

---

## 4. Lock Policy (排他制御ロック)
* **LockServiceProvider**:
  - 更新系操作が同時に実行された際の競合を回避するため、`LockService.getScriptLock()` または `LockService.getDocumentLock()` を用いて処理を直列化します。
  - **最大待機時間**: 10,000ms（デフォルト）。ロック取得失敗時は、呼び出し元に `HTTP 409 Conflict / Lock Timeout` 相当の JSON エラーを返却します。
  - **タイムアウト保護**: 例外発生時も `finally` ブロックで確実にロックを解放します。

---

## 5. Decoupled Spreadsheet Repository & Physical I/O (データ・物理I/O分離)
保守性の向上および I/O 操作のオーバーヘッド最小化のため、データアクセス層を物理操作層から完全に隔離します。

* **SpreadsheetRepository (データアクセスAPI)**:
  - データのスキーマ構造やドメイン定義の変換を管理。`SpreadsheetApp` のメソッドを一切直接呼び出さず、すべて Reader/Writer に処理を委譲。
* **SpreadsheetBatchReader (物理読み出し)**:
  - `getLastRow()` のループ内呼び出しなどを厳密に排除。
  - `Range` 指定による一括読み込み（`getValues()`）を行い、オンメモリでフィルタリングすることで API 呼び出し回数を最小化。
* **SpreadsheetBatchWriter (物理書き込み)**:
  - 更新・追加差分を二次元配列に蓄積し、`setValues()` を用いて1回で一括書き込みを実行。

---

## 6. API Response Metadata (APIレスポンス・メタデータ)
すべての API 応答には、システム監視・診断用の以下のメタデータを必ず含めます：

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "requestId": "req-1783731932845",
    "serverTimestamp": 1783731932845,
    "processingTime": 42,
    "cacheStatus": "HIT" | "MISS",
    "version": "1.0.0-RC1"
  }
}
```
