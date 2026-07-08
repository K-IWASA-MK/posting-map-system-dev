# AIOS Field Intelligence Operations View Specification
# Version: 1.0 (Phase 160)

## 1. 目的 (Objective)
現場からのリアルタイムのポスティング配布・移動データ（FieldOps）を AIOS Control Center 上に統合し、論理的なテナント・エリア構造に基づきマクロに観測する **Field Intelligence Operations View Foundation** を定義する。

---

## 2. 現場インテリジェンス観測モデル (Operational Observation Model)

### 2.1 データ駆動設計 (Data-Driven Design)
特定自治体（「桑名市」など）や特定支部名への依存を厳格に禁止する。
すべて `tenantId`, `regionId`, `areaId` に基づき動的にデータ・関係性をフィルタリングしてマッピングする。

```text
Tenant
 ↓
Region
 ↓
Area
 ↓
Field Operations Event (source: FIELDOPS)
 ↓
Intelligence Pipeline
```

### 2.2 Coverage（カバー率）および分類ルール (Coverage & Classification)
エリアごとの進捗カバー率（`coverageRate`）は以下の決定論的ルールに基づいてステータス分類される。AI による独自の予測・判断は厳禁とする。

| カバー率の範囲 | ステータスラベル (Status) |
| :--- | :--- |
| `0% - 50%` 未満 | `LOW` |
| `50% - 80%` 未満 | `NORMAL` |
| `80% - 100%` | `COMPLETE` |

---

## 3. 隔離境界と観測者原則 (Boundary & Observer Rules)

### 3.1 観測者境界の維持 (Observer Boundary)
* 本ビューは **完全な読み取り専用 (Read-Only)** である。
* 以下に該当する機能の実装は厳密に禁止する：
  - ❌ 配布員への指示、ルート変更、自動通知
  - ❌ 配布計画の作成、編集、削除（Write API、Kernelコマンド送信等）
  - ❌ AI によるランキングや推奨アクション、および自動制御
  - ❌ POSTING MAP データベースへの書き込み

### 3.2 不変性保証 (Immutable Rule)
* 集約された現場オペレーションデータは生成時に `Object.freeze()` によって不変化され、UI 側からの直接書き換えを防止する。
