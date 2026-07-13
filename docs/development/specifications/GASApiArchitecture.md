# GAS API Architecture Specification (SaaS Product Version 1.0)

## 1. 目的 (Purpose)
POSTING MAP Product Sprint 1 Phase S1-1 で策定された Spreadsheet Architecture を前提とし、Google Apps Script (GAS) バックエンドにおける API 契約 (API Schema)、データアクセス境界、認証検証ルール、およびエラーポリシーを定義する。

---

## 2. アーキテクチャ構成とデータ境界 (API Topology & Data Boundary)
- **API 境界原則 (API Boundary First)**:
  - GASはデータベースを内部保持しない「純粋なAPIプロキシ・変換層」として機能する。
  - 実データストアである Google Spreadsheet (SSOT) と、各種クライアント（Hアプリ、Webダッシュボード、将来の AIOS Bridge）の仲介のみを責務とする。
- **実行状態の隔離 (Stateless Execution)**:
  - GAS 実行コンテキスト内部に、永続的なキャッシュ、認証セッション、または未承認の実績状態を直接保持してはならない。

```
+------------------+     Fetch (JSON)     +-------------+     SpreadsheetApp API     +-----------------+
|   Web Clients    | <==================> |   GAS API   | <=======================>  |   Spreadsheet   |
| (H-App / Dash)   |                      | (doGet/Post)|                            |     (SSOT)      |
+------------------+                      +-------------+                            +-----------------+
```

---

## 3. 認証・認可境界 (Authentication & Authorization Boundary)
- **LINE ID 検証フロー (LINE Auth Boundary)**:
  - Hアプリ（配布員）またはダッシュボード起動時、LINE LIFF を介して LINE ログインを実行し、`lineUserId` を取得する。
  - クライアントはリクエスト時のパラメータに `lineUserId` を含めて GAS API を呼び出す。
  - GAS バックエンドは `lineUserId` を受け取ると、`MemberMaster` シートに登録された ID と照合し、権限ロール (`role`: `USER` \| `OPERATOR` \| `ADMIN` \| `SYSTEM`) を決定論的に解決する。
  - 権限を持たないユーザーからの API コールは、エラーポリシーに基づき即座に拒否する。

```
+--------------------+            lineUserId            +---------------+           MemberMaster Check           +-----------------+
| LIFF Client (Auth) | -------------------------------> |    GAS API    | -------------------------------------> |  Spreadsheet    |
+--------------------+                                  +---------------+                                        +-----------------+
                                                                |                                                         |
                                                                v                                                         v
                                                        [ Roll Resolve ] <========================================= [ Role Returned ]
                                                                |
                                              +-----------------+-----------------+
                                              | role: USER / ADMIN / OPERATOR     | -> ALLOW
                                              | role: GUEST                       | -> REJECT (Permission Error)
```

---

## 4. エンドポイント設計 (Endpoint Blueprint)

### 4.1. getDashboard (ダッシュボード統合データ取得)
- **目的**: Webダッシュボードの表示に必要なすべての情報を統合して取得する。
- **参照シート**: `AreaMaster`, `VoteTurnoutMaster`, `EventLog`
- **Request パラメータ**:
  - `action`: `"getDashboard"`
  - `params`: `{ tenantId: string, branchId: string }`
- **Response `data` スキーマ**:
  ```typescript
  {
    branchName: string,
    stats: {
      totalCompleted: number,
      totalHouseholds: number,
      progressRate: number
    },
    areas: Array<{
      areaId: string,
      areaName: string,
      doneCount: number,
      totalCount: number,
      latitude: number,
      longitude: number
    }>,
    cities: Array<{
      cityName: string,
      doneCount: number,
      totalCount: number
    }>
  }
  ```

### 4.2. getAreas (地区マスタ取得)
- **目的**: 地区マスタ情報（地図情報・世帯数等）を取得する。
- **参照シート**: `AreaMaster`
- **Request パラメータ**:
  - `action`: `"getAreas"`
  - `params`: `{ tenantId: string, branchId: string }`
- **Response `data` スキーマ**:
  ```typescript
  {
    areas: Array<{
      areaId: string,
      areaName: string,
      cityName: string,
      totalHouseholds: number,
      representativeAddress: string,
      latitude: number,
      longitude: number
    }>
  }
  ```

### 4.3. getVoteTurnout (地区別国政選挙投票率履歴取得)
- **目的**: 地区ごとの過去3回の国政選挙の投票率データを取得し、ダッシュボードでの可視化・分析を支援する。
- **参照シート**: `VoteTurnoutMaster`
- **Request パラメータ**:
  - `action`: `"getVoteTurnout"`
  - `params`: `{ areaId?: string }` // 特定地区または全地区
- **Response `data` スキーマ**:
  ```typescript
  {
    turnouts: Array<{
      areaId: string,
      electionId: string,
      electionType: "HOUSE_OF_REPRESENTATIVES" | "HOUSE_OF_COUNCILLORS",
      electionDate: string, // YYYY-MM-DD
      turnoutRate: number, // 0.000 ~ 1.000
      nationalAverage: number
    }>
  }
  ```
- **制約**: 本データを用いて自動で配布指示や優先順位の自律的決定を行ってはならない。

### 4.4. getEventLog (実績イベントログ取得)
- **目的**: 配布登録、GPS、写真同期等の実績イベントログを取得する。将来の AIOS Bridge 接続ポイントとなる。
- **参照シート**: `EventLog`
- **Request パラメータ**:
  - `action`: `"getEventLog"`
  - `params`: `{ limit?: number, sinceTimestamp?: number }`
- **Response `data` スキーマ**:
  ```typescript
  {
    logs: Array<{
      id: string, // EventID
      timestamp: number,
      tenantId: string,
      branchId: string,
      areaId: string,
      memberId: string,
      actionType: string,
      count: number,
      latitude: number,
      longitude: number,
      meta: object
    }>
  }
  ```

### 4.5. getInventory (在庫情報取得)
- **目的**: 各拠点・スタッフが保持するチラシ在庫情報を取得する。
- **参照シート**: `Inventory`, `FlyerMaster`
- **Request パラメータ**:
  - `action`: `"getInventory"`
  - `params`: `{ memberId?: string }`
- **Response `data` スキーマ**:
  ```typescript
  {
    inventories: Array<{
      inventoryId: string,
      flyerId: string,
      flyerName: string,
      holderId: string,
      holderType: "MEMBER" | "HUB",
      currentStock: number,
      lastUpdatedAt: number
    }>
  }
  ```

### 4.6. getMembers (利用者認証・メンバーリスト取得)
- **目的**: ログイン認証、配布員情報、および権限チェックを行う。
- **参照シート**: `MemberMaster`
- **Request パラメータ**:
  - `action`: `"getMembers"`
  - `params`: `{ lineUserId?: string }` // 特定のログインIDまたは全一覧
- **Response `data` スキーマ**:
  ```typescript
  {
    members: Array<{
      memberId: string,
      realName: string,
      displayName: string,
      role: "USER" | "OPERATOR" | "ADMIN" | "SYSTEM",
      status: "ACTIVE" | "INACTIVE"
    }>
  }
  ```

---

## 5. API 共通スキーマ (Common Json Schema)

### 5.1. Request Schema
```typescript
interface APIRequest {
  readonly action: string;
  readonly params: Record<string, any>;
}
```

### 5.2. Response Schema
```typescript
interface APIResponse {
  readonly success: boolean;
  readonly data?: Record<string, any>;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: any;
  };
}
```

---

## 6. エラーポリシー (Error Handling Policy)

GAS バックエンドでエラーが発生した場合、以下の共通コードでエラーレスポンスを返却する。

| エラーコード (Error Code) | 発生事由 | 説明 |
| :--- | :--- | :--- |
| `INVALID_REQUEST` | アクション名不足、不正なパラメータ形式 | クライアントへ速やかに修正を促す |
| `MISSING_DATA` | 必須パラメータの欠損、対象マスタデータ未存在 | 必須フィールド不在時のガード |
| `PERMISSION_ERROR` | LINE ID 未登録、または必要な権限ロール不足 | ログイン制限・不正アクセス防止 |
| `INTERNAL_ERROR` | スプレッドシート読み込み失敗、GAS内部システムエラー | 内部例外をラップし、白画面化を防止する |

---

## 7. データマッピングマトリクス (Data Mapping)

Spreadsheet の各列（snake_case）から API レスポンス（camelCase / PascalCase 含む）への変換規則は以下のように定義する。

```
[Spreadsheet: snake_case]      =======>     [GAS API Mapper]      =======>     [API Response: camelCase]

AreaMaster.area_id                          ==> Mapping ==>            areaId
AreaMaster.total_households                 ==> Mapping ==>            totalHouseholds
VoteTurnoutMaster.turnout_rate              ==> Mapping ==>            turnoutRate
MemberMaster.real_name                      ==> Mapping ==>            realName
FlyerMaster.total_stock                     ==> Mapping ==>            totalStock
Inventory.current_stock                     ==> Mapping ==>            currentStock
EventLog.blockId                            ==> Mapping ==>            areaId (互換性解決)
EventLog.userId                             ==> Mapping ==>            memberId (互換性解決)
```
- **例外事項**: 既存の `EventLog` シート（キャメルケース: `tenantId`, `branchId` 等）については、GAS Mapper 内で直接読み取り、API共通スキーマの命名規則にブリッジして返却する。
