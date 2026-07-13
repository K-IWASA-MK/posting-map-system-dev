# AIOS Tenant Intelligence Drilldown Specification
# Version: 1.0 (Phase 159)

## 1. 目的 (Objective)
複数テナント境界を前提として、`Tenant -> Region -> Area -> Field Intelligence` の順でデータと階層コンテキストを深掘り・ドリルダウンして追跡できる **Tenant Intelligence Drilldown Foundation** を構築する。
これにより、ユーザーはアクティブなテナントコンテキストとその下位階層（Region / Area / イベント等）の詳細な稼働・通信・品質状態を単一ビュー上で段階的・客観的に追跡できるようになる。

---

## 2. 汎用階層ドリルダウンデータ構造 (Hierarchy Drilldown Schema)

### 2.1 データ駆動設計 (Data-Driven Design)
* 特定自治体（「桑名市」など）や特定支部名への依存を厳格に禁止する。
* すべて `tenantId`, `regionId`, `areaId` に基づき動的にデータ・関係性をフィルタリングしてマッピングする。
* 指定された `tenantId` に対し、下位の Region 配下にある Area に一致する Timeline Event を抽出し、集計データを出力する。

### 2.2 ViewModel スキーマ
```typescript
interface TenantIntelligenceViewModel {
  tenantSummary: {
    tenantId: string;
    tenantType: string;
    regionCount: number;
    areaCount: number;
    eventCount: number;
  };
  regionSummary: {
    regionId: string;
    regionType: string;
    areaCount: number;
    eventCount: number;
  }[];
  areaSummary: {
    areaId: string;
    areaType: string;
    eventCount: number;
    lastActivity: string;
  }[];
  fieldEventSummary: {
    totalFieldEvents: number;
    standbyStatus: string; // CONNECTED or STANDBY
  };
}
```

---

## 3. 隔離境界と観測者原則 (Boundary & Observer Rules)

### 3.1 観測者境界 (Observer Boundary)
* 本ビューは **完全な読み取り専用 (Read-Only)** である。
* 階層をドリルダウン・選択するためのインタラクティブなセレクト UI、アコーディオン、ドロップダウン、および切り替えボタンは一切提供しない。
* システムが現在観測対象としている `DashboardTenantContext` / `DashboardHierarchyContext` に基づく詳細を段階的に一覧描画することに限定する。
* 操作エレメント（`button`, `form`, `input`, `select`）の数は **0 件** であること。
* Write API の呼び出し、Kernel コマンド送信、AI による自動推論・推薦・自動判断・自動制御は一切実装しない。

### 3.2 フォールバック規則 (DEFAULT Fallback Rule)
* アクティブなコンテキスト情報において `regionId` や `areaId` が未指定（空文字）である場合、または存在しない場合は `"DEFAULT"` として安全にフォールバックさせ、システム全体のクラッシュを防止する。
