# 実行コンテキスト仕様書 (Run Context Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、CLI経由でトリガーされた各実行タスクのスコープ、引数、開始・終了時刻、現在実行中のレイヤー、および全体ステータスを追跡・管理するための実行コンテキスト（Run Context）モデルを規定する。

---

## 実行コンテキストデータモデル (Run Context Model)
各実行スレッドに対して生成されるコンテキストオブジェクトの構造。

- **Run ID**: 実行トランザクションに割り当てられる一意の識別子（例: `RUN-2026-0707-1520`）。
- **User**: コマンドを起動したユーザー名（例: `岩佐CEO` または `CI/CD Runner`）。
- **Command**: 実行されているコマンドのオブジェクトリファレンス。
- **Start Time**: 処理が開始された日時（ISO 8601）。
- **End Time**: 処理が最終完了（または異常終了）した日時（ISO 8601）。
- **Target Layer**: パイプライン内で現在処理を実行している、または最後に処理したカーネルレイヤーの名称。
- **Status (実行状態)**: 現在のトランザクション実行ステータス。

---

## 実行ステータス定義 (Run Statuses)
実行トランザクションは、以下のいずれかの状態で決定論的に管理される。

| 実行ステータス | 状態解説 |
|---|---|
| **Created (作成済)** | 実行要求が受け付けられ、コンテキストが初期化されたが、処理が開始される前の状態。 |
| **Running (実行中)** | カーネルパイプラインのいずれかのレイヤーで処理を実行している状態。 |
| **Completed (完了)** | すべての処理ステージが正常に終了し、正常に完了した状態。 |
| **Failed (失敗)** | 処理途中でエラー、タイムアウト、または検証FAILにより異常終了した状態。 |
| **Cancelled (キャンセル)** | 手動での強制終了操作、または特定の割り込みによって処理が中断・キャンセルされた状態。 |

---

## 実行コンテキストデータ構造 (Run Context Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RunContextRecord",
  "type": "object",
  "properties": {
    "runId": { "type": "string" },
    "user": { "type": "string" },
    "command": { "type": "string" },
    "startTime": { "type": "string", "format": "date-time" },
    "endTime": { "type": "string", "format": "date-time" },
    "targetLayer": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["Created", "Running", "Completed", "Failed", "Cancelled"]
    }
  },
  "required": ["runId", "user", "command", "startTime", "targetLayer", "status"]
}
```
