# Dashboard Data Integration Specification (SaaS Product Version 1.0)

## 1. 目的 (Purpose)
POSTING MAP Product Sprint 1 Phase S1-1 で確定した Spreadsheet Architecture、Phase S1-2 で確定した GAS API Architecture をフロントエンドにマッピング・統合するための Webダッシュボード用データインテグレーション層の設計を定義する。

---

## 2. データインテグレーション・アーキテクチャ (Dashboard Data Architecture)
ダッシュボード UI と GAS API (および Spreadsheet DB) の間を疎結合に保つため、以下の 3層 のデータ統合モジュールを採用する。

```
+-------------------+
|   Dashboard UI    | <--- UI & Views (V2 Dashboard)
+-------------------+
          |
          v
+-------------------+
| DashboardState    | <--- State Management & Loading/Error Status
+-------------------+
          |
          v
+-------------------+
| DashboardMapper   | <--- JSON -> Front Model Mapping (snake_case to camelCase)
+-------------------+
          |
          v
+-------------------+
| DashboardClient   | <--- Fetch / HTTP Request & Response Validation
+-------------------+
          |
          v
     [ GAS API ]
```

---

## 3. フロントエンド・データモデル (Frontend Data Model)

### 3.1. DashboardData (統合データ)
```typescript
export interface DashboardData {
  readonly branchName: string;
  readonly stats: {
    readonly totalCompleted: number;
    readonly totalHouseholds: number;
    readonly progressRate: number;
  };
  readonly areas: readonly AreaDetail[];
  readonly cities: readonly CitySummary[];
}
```

### 3.2. AreaDetail (地区詳細)
```typescript
export interface AreaDetail {
  readonly areaId: string;
  readonly areaName: string;
  readonly cityName: string;
  readonly totalHouseholds: number;
  readonly representativeAddress: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly doneCount: number;
  readonly progressRate: number;
}
```

### 3.3. VoteTurnout (地区別選挙投票率)
```typescript
export interface VoteTurnout {
  readonly areaId: string;
  readonly electionId: string;
  readonly electionType: 'HOUSE_OF_REPRESENTATIVES' | 'HOUSE_OF_COUNCILLORS';
  readonly electionDate: string; // YYYY-MM-DD
  readonly turnoutRate: number; // 0.000 - 1.000
  readonly nationalAverage: number;
}
```

### 3.4. EventLogItem (活動実績イベント)
```typescript
export interface EventLogItem {
  readonly id: string;
  readonly timestamp: number;
  readonly tenantId: string;
  readonly branchId: string;
  readonly areaId: string;
  readonly memberId: string;
  readonly actionType: string;
  readonly count: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly meta: Record<string, any>;
}
```

### 3.5. InventoryItem (チラシ在庫)
```typescript
export interface InventoryItem {
  readonly inventoryId: string;
  readonly flyerId: string;
  readonly flyerName: string;
  readonly holderId: string;
  readonly holderType: 'MEMBER' | 'HUB';
  readonly currentStock: number;
  readonly lastUpdatedAt: number;
}
```

---

## 4. API データフローおよび表示マッピング (API Data Flow)

### 4.1. 初期表示時のロード
- 起動時に `getDashboard` を呼び出し、全体の進捗サマリー (`stats`)、都市別集計 (`cities`)、エリア進捗リスト (`areas`) を一括取得し、ダッシュボード初期表示とマップ表示を構築する。

### 4.2. 地区詳細クリック・ピン選択時
- 地図上または進捗リストから特定の `AreaID` を選択・クリックした際、非同期で `getVoteTurnout` および `getEventLog` (対象AreaIDにフィルタリング) を呼び出し、過去の投票率履歴と最近の配布証跡（写真・GPS）をマージしてパネルに表示する。

### 4.3. 在庫管理画面
- チラシマスタと手元・拠点在庫の整合を取るため、`getInventory` から現在のチラシ保管・移動状況を取得して描画する。

---

## 5. 状態管理および更新ポリシー (State Management & Refresh Policy)

- **状態管理**:
  - `isLoading`: データローディングフラグ。通信中は true になり、UI側でローダー・プレースホルダーを表示する。
  - `error`: API接続失敗、エラーコード受信時、例外発生時のエラーオブジェクトを格納。
  - `data`: 成功時にロードされた `DashboardData` の実体を保持。
- **データ更新 (Data Refresh)**:
  - データの最新化は、手動更新ボタンタップ、または1分周期のバックグラウンドポーリングによって GAS から差分を取得しマージする。
- **更新ガード**:
  - 画面遷移（タブ切り替え等）の発生直後は、過度なAPIコールを抑止するため、前回の取得から10秒未満のリクエストはキャッシュを直接返却する。

---

## 6. エラーハンドリング UI ポリシー (Error Policy)
- API接続切断、または `INVALID_REQUEST` / `PERMISSION_ERROR` / `INTERNAL_ERROR` を受信した場合、DashboardState は速やかに `error` 状態へ遷移する。
- UI は直ちに該当コンポーネントまたは全画面をエラーフォールバック表示に切り替え、エラーコードと分かりやすい日本語メッセージ（例:「データを取得できませんでした。ネットワーク環境をご確認ください。」）を表示して動作停止を防ぐ。
