# AIOS Tenant Hierarchy Context Specification
# Version: 1.0 (Phase 156)

## 1. 目的 (Objective)
AIOS Dashboard およびデータパイプラインにおいて、現在の Tenant Context（「誰のデータか」）を拡張し、「どの階層のデータか」を表現・観測するための **Tenant Hierarchy Context Foundation** を定義する。
本仕様は、将来的に自治体・支部・エリア展開を可能とする汎用階層モデルを提供する。

---

## 2. 階層モデル設計 (Hierarchy Schema)

すべてのデータおよびコンテキストは、以下の汎用 3 階層ツリー構造に従う。
特定自治体（桑名市など）や特定政治支部等の固有名称・ロジックを直接プログラムにハードコーディングすることは禁止する。

```text
Tenant (組織 / 支部 / 企業)
 └── Region (地域 / 自治体 / 店舗グループ)
       └── Area (地区 / 配布ブロック / 個別店舗)
             └── Event (現場活動 / ログイベント)
```

### 2.1 データスキーマ (Data Schema)

#### Hierarchy Definition
```typescript
interface TenantHierarchy {
  tenantId: string;
  tenantType?: string; // 将来拡張用: "political", "municipality", "enterprise", "organization" など
  hierarchy: {
    regions: Region[];
  };
}

interface Region {
  regionId: string;
  regionName: string;
  regionType?: string; // 将来拡張用: "prefecture", "district", "branch" など
  areas: Area[];
}

interface Area {
  areaId: string;
  areaName: string;
  areaType?: string; // 将来拡張用: "city", "zone", "block" など
}
```

#### Hierarchy Context Definition
現在アクティブな表示・観測の対象階層コンテキストを表す。
```typescript
interface HierarchyContext {
  tenantId: string;
  regionId: string;
  areaId: string;
}
```

---

## 3. 責務定義と境界ルール

### 3.1 階層構造の責務
1. **Tenant (組織境界)**:
   - 全データアクセスの最上位ルート。
   - 異なる Tenant 間のデータ混入を防止する。
2. **Region (地域境界)**:
   - 支部内の大区分。政令指定都市や特定の活動市区町村などを表現。
3. **Area (地区境界)**:
   - 現場のポスティング配布単位。地図上のポリゴンやルートに紐づく。

### 3.2 観測者境界 (Observer Boundary)
* 本階層定義は **読み取り専用 (Read-Only)** である。
* 認証・認可、アクセス権限管理、課金（Stripe等）は一切含めない。
* 階層構造を編集・操作する UI（階層追加・更新・削除ボタン等）の構築は禁止する。

### 3.3 不変性ルール (Immutable Rule)
* すべての階層データおよびコンテキストは、生成時に `Object.freeze()` によって凍結される。
* Store や Context から受け取るデータは変更不可能であり、UI 側からの直接書き換えは許容しない。

---

## 4. イベント階層スキーマ統合と後方互換 (Event Integration & Fallback)

現場活動イベント (`FieldOpsEvent`) に階層プロパティを追加し、イベントが「どのエリア」「どの地域」に属するかを特定できるようにする。

### 4.1 FieldOpsEvent スキーマ拡張
```javascript
{
  eventId: "evt-field-...",
  tenantId: "MIE-03",
  regionId: "REGION-001", // 追加
  areaId: "AREA-001",     // 追加
  sourceType: "FIELDOPS",
  category: "field_operation",
  // ... (その他の属性)
}
```

### 4.2 後方互換 (Fallback) 仕様
過去のログデータや、階層 ID が欠落したイベントを許容するため、以下のデフォルトフォールバックを適用する。
* `regionId` 欠落時: `"DEFAULT"` (表示名: `Default Region`)
* `areaId` 欠落時: `"DEFAULT"` (表示名: `Default Area`)
* `tenantId` 欠落時: `"DEFAULT"` (表示名: `Default Tenant`)
