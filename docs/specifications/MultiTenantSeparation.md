# AIOS Multi-Tenant Separation View Specification
# Version: 1.0 (Phase 157)

## 1. 目的 (Objective)
AIOS Dashboard において、複数のテナント（Tenant）のデータ境界を安全に観測・可視化するための **Multi-Tenant Separation View Foundation** を定義する。
本仕様は、将来のマルチテナント化展開を見据え、システム内部で複数のテナント境界が存在することを認識・一覧表示できる読み取り専用の観測基盤を提供する。

---

## 2. データスキーマと境界分離規則 (Multi-Tenant Schema & Isolation Rules)

### 2.1 テナントレジストリスキーマ (Tenant Registry Schema)
システムに登録されている観測対象テナントの一覧を表現する。
特定政治団体名や特定自治体名の固定条件分岐をプログラム内に実装することは厳禁とする。

```typescript
interface TenantRegistry {
  tenants: TenantRegistryItem[];
}

interface TenantRegistryItem {
  tenantId: string;
  tenantName: string;
  tenantType: string; // e.g., "political", "enterprise"
}
```

### 2.2 テナントビューデータスキーマ (Tenant View Model Schema)
各テナントの階層構造（Region数、Area数）および蓄積されているイベント数（Timelineイベント総数）を集約・観測するためのビューモデル。

```typescript
interface MultiTenantViewModel {
  tenants: MultiTenantViewItem[];
}

interface MultiTenantViewItem {
  tenantId: string;
  tenantName: string;
  tenantType: string;
  regionCount: number;
  areaCount: number;
  eventCount: number;
}
```

---

## 3. 隔離境界と観測者原則 (Boundary & Observer Rules)

### 3.1 データ隔離表示規則 (Data Isolation Representation)
* テナントAとテナントBのメトリクス（イベント数、エリア数）は完全に分離された行またはカードとして表示する。
* 合算表示や、他テナントへのデータ漏洩・誤混入を防止するため、集計処理はテナントごとに完全に排他的に行う。

### 3.2 観測者境界の維持 (Observer Boundary)
* 本ビューは **完全な読み取り専用 (Read-Only)** である。
* 以下に該当する機能の実装は厳密に禁止する：
  - ❌ ログイン認証、権限管理 (Role-Based Access Control)
  - ❌ 表示中のテナントを切り替える対話的 UI（セレクトボックス等）
  - ❌ テナントの作成、編集、削除（Write API、Kernelコマンド送信等）
  - ❌ 自動ルーティング、ユーザー管理、課金管理 (Stripe接続など)
  - ❌ AI による自律的なテナント分類やリスク予測

### 3.3 不変性保証 (Immutable Rule)
* すべてのストアデータおよびビューモデルデータは、生成時に `Object.freeze()` によって不変化される。

---

## 4. データおよびUI統合設計

### 4.1 ルーティング統合
* ダッシュボードのサイドバーに `Tenant Boundary` リンクを追加し、URL パラメータ `?view=tenant` をサポートする。
* 既存ビュー（`executive`, `mobile`, `raw`, `trust`）の構造を破壊しないよう、最小限のレイアウト追加として設計する。

### 4.2 UIコンポーネント配置
* `?view=tenant` 画面において、登録されている全テナントのサマリー（ID、名称、地域数、エリア数、イベント受信件数）を漆黒ガラスモーフィズムカード形式で一覧描画する。
* 操作用 UI（ボタン、インプット等）は一切持たず、純粋な可視化データのみで構成する。
