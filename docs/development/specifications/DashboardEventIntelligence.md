# Dashboard Event Intelligence Specification (DashboardEventIntelligence.md)

## 1. ルールベース分類の基本方針 (Rule-based Event Classification)
AIOS Dashboard に搭載する「Event Intelligence」は、受信イベントを適正な表示エリアおよび重要度グループに振り分けるための **静的ルールベース分類 (Rule-based Classification)** に限定される。
機械学習や自律決定 AI（LLM 等）による予測、自律対応（Kernel 操作・書き換え等）は一切行わず、決定論的なパターンマッチングによってのみ動作する。

---

## 2. イベント分類スキーマとプロセスフロー
受信したイベントは以下の決定論的フローを経て分類・処理される。
```
[生イベント受信 (SSE / Polling Backup)]
                  │
                  ▼
       [スキーマバリデーション] (ID・タイムスタンプ検証)
                  │
                  ▼
       [重複排除 (Replay防止)] (過去 10 分間の履歴ストア評価)
                  │
                  ▼
     [DashboardEventClassifier] (カテゴリ分類)
                  │
                  ▼
      [DashboardSeverityMapper] (重要度マッピング: CRITICAL/WARNING/INFO)
                  │
                  ▼
      [DashboardAttentionQueue] (優先度順ソート ➔ 描画へ)
```

### カテゴリ分類ルール
- **runtime**: カーネルの死活・初期化に関連するイベント（`KERNEL_INITIALIZED`, `KERNEL_HEARTBEAT` 等）。
- **governance**: 本部・支部承認やポリシー適用に関するイベント（`GOVERNANCE_APPROVED`, `GOVERNANCE_RULE_VIOLATION` 等）。
- **quality**: 品質ゲートや監査結果に関するイベント（`QUALITY_GATE_PASS`, `QUALITY_GATE_FAIL` 等）。
- **simulation**: シミュレーションテストの実行状況に関するイベント（`SIMULATION_RUN_START`, `SIMULATION_RUN_PASS` 等）。
- **trust**: システムの境界隔離や信頼性に関するイベント（`TRUST_BOUNDARY_ALERT` 等）。
