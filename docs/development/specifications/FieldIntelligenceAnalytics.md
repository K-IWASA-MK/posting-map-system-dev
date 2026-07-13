# AIOS Field Intelligence Analytics Specification
# Version: 1.0 (Phase 161)

## 1. 目的 (Objective)
現場 (FieldOps) 観測データを基盤として、現場活動の「事実（履歴・推移・比較）」をマクロ・ミクロに可視化し、証跡化するための **Field Intelligence Analytics Foundation** を定義する。

---

## 2. 分析データモデルと分類ルール (Analytics Schema & Rules)

### 2.1 データ駆動設計 (Data-Driven Design)
* 特定自治体名や特定支部名への依存を厳格に禁止する。
* すべて `tenantId`, `regionId`, `areaId` に基づき、時系列（日別、月間）およびエリア別での活動件数と進捗推移を集計する。

### 2.2 分析項目 (Analyzed Metrics)
1. **日別イベント推移 (Daily Event Trend)**:
   - 過去数日間における日別の FieldOps 受信イベント数の時系列推移。
2. **Coverage 履歴 (Coverage History)**:
   - テナント全体の平均カバー率の変動履歴。
3. **エリア別活動量比較 (Area Activity Comparison)**:
   - エリアごとの累計活動件数とカバー率の単純比較。
4. **前日比較 (Day-over-Day Comparison)**:
   - 前日の総イベント数と本日のイベント数の単純な変化量（比率）。

---

## 3. 隔離境界と観測者原則 (Boundary & Observer Rules)

### 3.1 観測者境界の維持 (Observer Boundary)
* 本ビューは **完全な読み取り専用 (Read-Only)** である。
* 以下の表現および機能の実装は厳密に禁止する：
  - ❌ AI による分析・評価、自動判定
  - ❌ 未来予測、完了予測、遅延予測
  - ❌ 次に配布すべき場所の推奨、最適ルート提案
  - ❌ 人員配置提案、配布指示、自動通知
  - ❌ 配布計画の作成、編集、削除（Write API / Kernel コマンド）

### 3.2 証跡化の重視 (Audit Traceability)
* 自由な現場活動の「記録 ➔ 整理 ➔ 可視化 ➔ 証跡化」のサイクルを保証するため、客観的事実の提示のみを行う。

---

## 4. 画面・UI統合設計

### 4.1 ルーティング統合
* URL パラメータ `?view=analytics` をサポートし、サイドバーメニューに `Field Analytics` リンクを追加する。
* 既存のビューを一切破壊しない設計を維持する。

### 4.2 UIコンポーネント配置
* `?view=analytics` 画面において、時系列推移（日別、月間）およびエリア別の活動比較を漆黒ガラスモーフィズムカード形式で一覧描画する。
* 操作用 UI は一切持たず、純粋な可視化データのみで構成する。
