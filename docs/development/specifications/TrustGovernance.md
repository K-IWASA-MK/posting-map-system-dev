# Trust Governance Specification

AIOS Dashboardにおけるシステム自己監査・規約順守状態（Trust Governance）に関する定義書。
本仕様は、ガバナンス状態の客観的提示に徹し、AIによる診断・セキュリティ脅威判断および自動修復アクションは一切行わない。

---

## 1. 監査レコードデータスキーマ (Trust Audit Schema)

観測メトリクスを表す不変オブジェクト構造。Object生成時に `Object.freeze()` の適用を必須とする。

```typescript
interface TrustAuditRecord {
  tenantId: string;         // 現在のテナント隔離識別子 (e.g. "MIE-03")
  recordId: string;         // レコードの一意識別コード
  category: "observer_boundary" | "immutability" | "tenant_isolation";
  metricName: string;       // メトリクス表示名称
  status: "PASS" | "NOTICE" | "FAIL"; // 順守判定
  score: number;            // 項目達成度 (0-100)
  lastChecked: string;      // 監査時刻のISO 8601表記
  details: string;          // 観測事実に関する文字列表記
}
```

---

## 2. 状態判定閾値ルール (Governance Status Mapping)

信頼性状態のステータス名称は、Pipeline Healthの流量状態（HEALTHY / ATTENTION / CONGESTED）と明確に責務分離するため、`PASS`、`NOTICE`、`FAIL` を使用する。

### [A] Observer Boundary (監視境界) 状態
* **`PASS`**: 画面内に配置された button, form, input, select などの操作要素数が 0件 であり、かつ POST, PUT, PATCH, DELETE 通信の発生が 0件 の状態（スコア: 100）。
* **`NOTICE`**: 回帰検知等により操作要素または書き込みリクエスト数が 1〜2件 検出された状態（スコア: 50–90）。
* **`FAIL`**: 操作要素または書き込みリクエスト数が 3件以上 検出された状態（スコア: 0）。

### [B] Immutable Store (不変ストレージ) 状態
* **`PASS`**: ストアに新規登録されるオブジェクトが 100% `Object.isFrozen()` に合格している状態（スコア: 100）。
* **`NOTICE`**: ストア登録されたオブジェクトの一部に Freeze が未処理のものが 1〜2件 含まれる状態（スコア: 80）。
* **`FAIL`**: Freeze 未処理のデータが 3件以上 検出された状態（スコア: 0）。

### [C] Tenant Context (マルチテナント隔離) 状態
* **`PASS`**: ストアに保存された全データの `tenantId` 属性が正常に解決され、欠損・DEFAULT化が発生していない状態（スコア: 100）。
* **`NOTICE`**: `tenantId` が未設定で `DEFAULT` にフォールバックしたデータが 1〜5件 検出された状態（スコア: 80）。
* **`FAIL`**: `DEFAULT` にフォールバックしたデータが 6件以上 検出された状態（スコア: 40以下）。

---

## 3. Compliance Score (順守率スコア) 表示ルール
AIOS自身が自己の信頼度を主観的・動的に自己評価しているような表現（例:「AIOS 信頼度 98%」等）は厳禁とする。
表示は、チェック項目の達成状態を示す **`Compliance Score`** (例: `100 / 100`) として表現しなければならない。

* **表示例**:
  - `Compliance Score: 100 / 100`
  - `Governance Checks:`
    - `Observer Boundary: PASS`
    - `Immutable Store: PASS`
    - `Tenant Context: PASS`
