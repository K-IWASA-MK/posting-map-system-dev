# 統合確認モック仕様書 (Integration Mock Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、これまで構築された8つのカーネルレイヤー（Execution, Review, Quality, Self Review, Self Improvement, Learning, Optimization, Governance）および監視レイヤー（Dashboard）の接続・データの受け渡しが決定論的かつ不整合なく繋がっているかをシミュレーション確認するための「統合モック（Integration Mock）」の検証構成を定義する。

---

## 接続確認の責務 (Verification Responsibilities)
本モックは実際のコード修正やAI実行を行うものではなく、以下の4つのデータフロー接続の整合性検証（Bypassなし）に特化して定義される。

### 1. パイプラインフロー (Pipeline Flow Verification)
- **検証対象**:
  - ステージ 1（Execution）からステージ 16（Output）までの制御遷移が、正しいトリガー（PASS/FAILイベント）によってシームレスに進行するか。
- **合格基準**: FAIL検知時に早期終了（Early Termination）が機能し、即座に改善提案へ分岐すること。

### 2. イベントフロー (Event Flow Verification)
- **検証対象**:
  - 各カーネルエンジンが処理を開始・完了した際、ステータス変更イベント（例: `Active` ──> `Idle`）が正しく発報されるか。
- **合格基準**: 発報されたイベントがダッシュボード（Observer）に遅延なく検知・反映されること。

### 3. データフロー (Data Flow Verification)
- **検証対象**:
  - 前段エンジンが出力したJSONスキーマのキー値（例: Quality Engine の `OverallScore` や Optimization Engine の `MergeCandidates`）が、後段エンジンで型やキーのミスマッチ（不整合）を起こさずに受信できるか。
- **合格基準**: 全レイヤーの I/O スキーマの整合性が100%一致し、パースエラー（Syntax Error）が発生しないこと。

### 4. 状態フロー (Status Flow Verification)
- **検証対象**:
  - いずれかのレイヤーで処理エラー（Error）が発生した際、またはバイパス設定（Disabled）された際、そのステータス変化がシステム状態（`KernelStatus`）に波及するか。
- **合格基準**: 特定レイヤーの異常が、ダッシュボードの全体健全性インジケーター（Warning/Error）に追従連動すること。

---

## 統合確認データフロー図 (Data Flow Diagram)
統合モックが確認するデータの方向と依存度。

```
[Execution Diff] ──> [Review Results] ──> [Quality Score JSON] ──> [Self Review Decision]
                                                                          │
                                                                          ▼
[Learning History] <── [Applied Change & Delta] <── [Execution Unit] <── [Improvement Plan]
        │
        ▼
[Optimization Report] ──> [Governance Decision & Audit] ──> [Dashboard Observer (横断観測)]
                                                                  │
                                                                  ▼
                                                          [Human UI Display]
```
