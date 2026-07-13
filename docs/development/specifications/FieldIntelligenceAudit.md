# AIOS Field Intelligence Audit Specification
# Version: 1.0 (Phase 164)

## 1. 目的 (Objective)
現場活動の証跡（Field Intelligence Evidence）を体系的に管理・可視化し、システムと活動状態を整合的に監査可能な状態に保つ **Field Intelligence Audit Foundation** を定義する。
本仕様は、改ざん不能な監査対象レコード（Audit Record）を決定論的に生成し、Observer（監視専用）コンテキストのもとで表示するための基準である。

---

## 2. 監査レコード定義 (Audit Record Definition)

### 2.1 データ構造 (Data Schema)
生成される各 Audit Record は以下のキーを持つ不変オブジェクト（Immutable Object）である。

```typescript
interface AuditRecord {
  readonly auditId: string;         // 決定論的識別子: `aud-${evidenceId}`
  readonly evidenceId: string;      // ソースとなる Evidence Record ID
  readonly tenantId: string;        // 対象テナントID (例: "MIE-03")
  readonly regionId: string;        // 対象リージョンID (例: "REGION-001")
  readonly areaId: string;          // 対象エリアID (例: "AREA-001")
  readonly eventCount: number;      // 紐づく現場活動イベントの総件数
  readonly auditTime: string;       // 監査タイムスタンプ (Evidence の生成時刻を継承)
}
```

### 2.2 状態の不変性 (Immutability)
- すべての Audit Record およびそれらを格納する配列は、`Object.freeze()` を用いてディープ・フリーズ（各階層での凍結）を行わなければならない。
- 実行時における値の書き換え、プロパティの追加・削除は JavaScript エンジンレベルで `TypeError` をスローするよう設計する。

---

## 3. 決定論的生成ルール (Deterministic Generation Rule)

Audit Record は、以下のパイプラインに沿って**完全な決定論（Deterministic）**で生成されなければならない。

```
Timeline (事実) ➔ History (時系列履歴) ➔ Evidence (監査証跡) ➔ Audit (監査レコード)
```

1. **データソース**:
   - `DashboardFieldEvidenceStore.getEvidenceData()` から取得した現場証跡レコードリストを入力とする。
2. **監査マッピング**:
   - 各 Evidence Record につき、1件の Audit Record を一対一で決定論的に生成する。
   - `auditId` は `aud-${evidence.evidenceId}` と決定する。
   - `evidenceId`, `tenantId`, `regionId`, `areaId`, `eventCount`, `auditTime` (Evidenceの `generatedTime`) をそのまま継承する。
3. **AIの排除**:
   - AI による監査合否判定、リスクレベル評価、アドバイス、改善案提示は一切介在させない。データ構造の変換のみを行う。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本機能およびビューは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - 作成、編集、削除などの編集系UIは完全に排除する。
- **文言制限**:
  - AI による「予測」「推奨」「最適」「指示」「配置提案」「改善案」「リスク評価」等のテキストや、これらを暗示するUI装飾は一切含めない。
