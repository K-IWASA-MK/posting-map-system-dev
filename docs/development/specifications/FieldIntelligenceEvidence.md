# AIOS Field Intelligence Evidence Specification
# Version: 1.0 (Phase 163)

## 1. 目的 (Objective)
現場活動の歴史的証跡（Field Intelligence History）をさらに構造化し、政治的・現場的活動を監査可能な単位として客観的に記録する **Field Intelligence Evidence Foundation** を定義する。
本仕様は、改ざん不能な監査証跡（Evidence Record）を決定論的に生成し、Observer（監視専用）コンテキストのもとで表示するための基準である。

---

## 2. 証跡レコード定義 (Evidence Record Definition)

### 2.1 データ構造 (Data Schema)
生成される各 Evidence Record は以下のキーを持つ不変オブジェクト（Immutable Object）である。

```typescript
interface EvidenceRecord {
  readonly evidenceId: string;      // 決定論的識別子: `evd-${tenantId}-${regionId}-${areaId}`
  readonly tenantId: string;        // 対象テナントID (例: "MIE-03")
  readonly regionId: string;        // 対象リージョンID (例: "REGION-001")
  readonly areaId: string;          // 対象エリアID (例: "AREA-001")
  readonly eventCount: number;      // 紐づく現場活動イベントの総件数
  readonly generatedTime: string;   // 生成時刻 (HH:MM:SS 形式、または ISO 形式)
}
```

### 2.2 状態の不変性 (Immutability)
- すべて of Evidence Record およびそれらを格納する配列は、`Object.freeze()` を用いてディープ・フリーズ（各階層での凍結）を行わなければならない。
- 実行時における値の書き換え、プロパティの追加・削除は JavaScript エンジンレベルで `TypeError` をスローするよう設計する。

---

## 3. 決定論的生成ルール (Deterministic Generation Rule)

Evidence Record は、以下のパイプラインに沿って**完全な決定論（Deterministic）**で生成されなければならない。

```
Timeline (事実) ➔ History (時系列履歴) ➔ Evidence (監査証跡)
```

1. **データソース**:
   - `DashboardFieldHistoryStore.getHistoryData()` から取得した現場履歴イベントリスト（`history`）を入力とする。
2. **グループ化と集計**:
   - `tenantId`, `regionId`, `areaId` のユニークな組み合わせごとにグループ化する。
   - 各グループに含まれるイベントの個数をカウントし、それを `eventCount` とする。
3. **識別子生成**:
   - `evidenceId` は、`evd-${tenantId}-${regionId}-${areaId}` のように、入力データから一意に決定されるルールで命名する。
4. **AIの排除**:
   - AI による状態評価、異常検知、推論、アドバイスは一切介在させない。計算式のみに基づく客観的な集計を行う。

---

## 4. 観測者境界の維持 (Observer Boundary Constraints)

本機能およびビューは、厳格な **Observer Only（監視専用）** である。

- **インターフェース制限**:
  - `button`, `form`, `input`, `select`, `textarea` などのユーザー入力・操作用要素は一切配置しない（0件）。
  - 作成、編集、削除などの編集系UIは完全に排除する。
- **文言制限**:
  - AI による「予測」「推奨」「最適」「指示」「配置提案」「改善案」等のテキストや、これらを暗示するUI装飾は一切含めない。
