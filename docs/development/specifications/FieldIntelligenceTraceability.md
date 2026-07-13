# AIOS Field Intelligence Traceability Specification
# Version: 1.0 (Phase 165)

## 1. 目的 (Objective)
現場活動の事実（Timeline）、長期履歴（History）、証跡（Evidence）、監査（Audit）の各レイヤー間の由来・因果関係（Traceability）を決定論的かつ不変的に関連付ける **Field Intelligence Traceability Foundation** を定義する。
本仕様は、改ざん不能な追跡レコード（Trace Record）を決定論的に生成し、Observer（監視専用）コンテキストのもとで表示するための基準である。

---

## 2. 追跡レコード定義 (Trace Record Definition)

### 2.1 データ構造 (Data Schema)
生成される各 Trace Record は以下のキーを持つ不変オブジェクト（Immutable Object）である。

```typescript
interface TraceRecord {
  readonly traceId: string;         // 決定論的識別子: `trc-${auditId}`
  readonly auditId: string;         // ソースとなる Audit Record ID
  readonly evidenceId: string;      // ソースとなる Evidence Record ID
  readonly historyId: string;       // 関連する履歴イベントIDのリスト (カンマ区切りの文字列)
  readonly timelineId: string;      // 関連するタイムラインイベントIDのリスト (カンマ区切りの文字列)
  readonly tenantId: string;        // 対象テナントID (例: "MIE-03")
  readonly regionId: string;        // 対象リージョンID (例: "REGION-001")
  readonly areaId: string;          // 対象エリアID (例: "AREA-001")
}
```

### 2.2 状態の不変性 (Immutability)
- すべての Trace Record およびそれらを格納する配列は、`Object.freeze()` を用いてディープ・フリーズ（各階層での凍結）を行わなければならない。
- 実行時における値の書き換え、プロパティの追加・削除は JavaScript エンジンレベルで `TypeError` をスローするよう設計する。

---

## 3. 決定論的生成ルール (Deterministic Generation Rule)

Trace Record は、以下のパイプラインに沿って**完全な決定論（Deterministic）**で生成されなければならない。

```
Timeline ➔ History ➔ Evidence ➔ Audit ➔ Trace
```

1. **データソース**:
   - `DashboardFieldAuditStore.getAuditData()` から取得した監査レコードリストを入力とする。
   - `DashboardFieldHistoryStore.getHistoryData()` から取得した現場履歴イベントリストを入力とする。
2. **監査・履歴追跡マッピング**:
   - 各 Audit Record につき、1件の Trace Record を一対一で決定論的に生成する。
   - `traceId` は `trc-${audit.auditId}` と決定する。
   - 履歴イベントリストから、テナント、Region、Area が一致するイベント群を抽出する。
   - 抽出したイベント群の `eventId` リストを収集し、`historyId` および `timelineId` としてカンマ区切りで格納する。
3. **AIの排除**:
   - AI による原因分析、推論、アドバイス、改善案提示は一切介在させない。計算機的な対応関係の解決のみを行う。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本機能およびビューは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - 作成、編集、削除などの編集系UIは完全に排除する。
- **文言制限**:
  - AI による「原因分析」「予測」「推奨」「最適」「指示」「配置提案」「改善案」等のテキストや、これらを暗示するUI装飾は一切含めない。
