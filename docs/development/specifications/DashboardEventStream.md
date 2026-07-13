# Dashboard Event Stream Specification (DashboardEventStream.md)

## 1. 基本データ構造 (Event Schema)
Event Stream を通じて流れるイベントデータは、以下の共通スキーマを満たさなければならない。

```json
{
  "eventId": "evt_20260708_998877",
  "timestamp": "2026-07-08T00:28:00.000Z",
  "source": "kernel",
  "type": "QUALITY_GATE_PASS",
  "payload": {}
}
```

### スキーマプロパティ定義
- `eventId`: イベントの一意のID。重複受信（Replay）を排除するための排除キー。
- `timestamp`: ISO 8601 形式の協定世界時。
- `source`: 送信元モジュール名（例: `kernel`, `governance`, `simulation`）。
- `type`: イベントタイプを示す文字列。大文字スネークケース固定。
- `payload`: 各イベント種別に応じた固有のデータオブジェクト。

---

## 2. イベント分類とタイプマップ

ダッシュボードが監視・解釈する主要イベントは以下のように分類される。

| カテゴリ | イベントタイプ (Type) | 意味 | 描画影響 |
|---|---|---|---|
| **Kernel Runtime** | `KERNEL_HEARTBEAT` | 生存確認用信号 | バッジ生存時間の更新 |
| | `KERNEL_INITIALIZED` | カーネル起動成功 | ログ追加、StatusCard更新 |
| **Governance** | `GOVERNANCE_RULE_VIOLATION` | ルール違反の検知 | ログ警告追加、バッジ変更 |
| | `GOVERNANCE_APPROVED` | 申請の承認 | ログ追加、バッジ加算 |
| **Quality** | `QUALITY_GATE_PASS` | 品質ゲート突破 | ログ追加、品質指標更新 |
| | `QUALITY_GATE_FAIL` | 品質不適合の検知 | ログ警告追加、品質指標更新 |
| **Simulation** | `SIMULATION_RUN_START` | シミュレーション開始 | ログ追加、StatusCard更新 |
| | `SIMULATION_RUN_PASS` | シミュレーション合格 | ログ追加、パス回数更新 |
| **Trust / Security**| `TRUST_BOUNDARY_ALERT` | 隔離境界突破のアラート | ログ緊急追加、セキュリティ警告 |

---

## 3. スキーマ検証 (Event Schema Validation)
`DashboardRealtimeAdapter` への入力直後に、以下の必須項目が存在するか検証する。
- 必須項目: `eventId`, `timestamp`, `type`
- 不足している場合、または `timestamp` のフォーマットが不正な場合は `INVALID_EVENT` として破棄（DROP）し、UI コンポーネントへは一切データを受け渡さないことで UI 崩壊を防止する。
