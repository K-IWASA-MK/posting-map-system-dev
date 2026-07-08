# AIOS Multi-Tenant Executive Aggregation View Specification
# Version: 1.0 (Phase 158)

## 1. 目的 (Objective)
複数テナントにまたがるデータ（テナント数、地域数、エリア数、受信イベント数、信頼性スコア等）を横断的かつマクロに集約し、経営的な視点から AIOS Control Center 全体の稼働状態を俯瞰・観測する **Multi-Tenant Executive Aggregation View Foundation** を定義する。

---

## 2. 集計データスキーマとルール (Aggregation Schema & Rules)

### 2.1 集計データスキーマ (Aggregation Schema)
横断的に集計されたグローバルメトリクスを表現する。特定テナント名等のハードコーディングは厳禁とする。

```typescript
interface GlobalExecutiveViewModel {
  totalTenants: number;
  totalRegions: number;
  totalAreas: number;
  totalEvents: number;
  averageTrustScore: number;
}
```

### 2.2 横断的集計ルール (Aggregation Rules)
1. **Total Tenants (総テナント数)**:
   - テナントレジストリストアに登録されているテナントの総ユニーク数。
2. **Total Regions (総地域数)**:
   - 全テナントの配下にある Region 数の総和。
3. **Total Areas (総エリア数)**:
   - 全テナントの配下に属する Area 数の総和。
4. **Total Events (総受信イベント数)**:
   - 全テナントからタイムラインストアに受信・蓄積された全イベントの総和。
5. **Average Trust Score (平均信頼性スコア)**:
   - 全テナントごとの信頼性コンテキストスコア（Trust Governance 層で算出されるスコア）の算術平均値。

---

## 3. 隔離境界と観測者原則 (Boundary & Observer Rules)

### 3.1 観測者境界の維持 (Observer Boundary)
* 本ビューは **完全な読み取り専用 (Read-Only)** である。
* 以下に該当する機能の実装は厳密に禁止する：
  - ❌ ログイン認証、権限管理 (RBAC)
  - ❌ テナント間の切り替えや操作を伴う対話型 UI（ドロップダウン等）
  - ❌ テナントの作成、編集、削除（Write API、Kernelコマンド送信等）
  - ❌ AI によるランキングや推奨アクション、および自動制御

### 3.2 不変性保証 (Immutable Rule)
* 集約モデルデータは生成時に `Object.freeze()` によって不変化され、UI 側からの直接書き換えを防止する。

---

## 4. 画面・UI統合設計

### 4.1 ルーティング統合
* URL パラメータ `?view=global` をサポートし、サイドバーメニューに `Global Overview` リンクを追加する。
* 既存のビュー（`raw`, `executive`, `mobile`, `trust`, `tenant`）を一切破壊しないように設計する。

### 4.2 UIコンポーネント配置
* `?view=global` 画面において、横断集計メトリクス（Tenants数、Regions数、Areas数、Events受信数、平均Trust Score）を漆黒ガラスモーフィズムカード形式で一覧描画する。
* 操作用 UI（ボタン、インプット等）は一切持たず、純粋な可視化データのみで構成する。
