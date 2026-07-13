# カーネル状態仕様書 (Kernel Status Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、現在稼働している8つのカーネルレイヤーの実行コンテキスト、現在のヘルス、バージョン、および動作状態（Layer Status）を一元的に定義し、監視するための状態データモデルを規定する。

---

## 状態定義項目 (Status Fields)
各カーネルレイヤーは、監視のために以下のメタデータをダッシュボード（または状態監視エージェント）へ定期的に提供しなければならない。

- **Layer Name**: レイヤーの識別名（Execution / Review / Quality / Self Review / Self Improvement / Learning / Optimization / Governance）。
- **Layer Status**: 現在の稼働ステータス。
- **Version**: レイヤーに適用されているモジュールバージョン。
- **Health (ヘルス)**: 動作の健全性（0.0〜1.0）。直近のエラー発生率やレスポンスタイムから算出される。
- **Last Execution**: 最後にそのレイヤーの処理が実行されたタイムスタンプ。
- **Last Update**: レイヤーの構成定義やバージョンが更新された最終日時。

---

## レイヤー状態区分 (Layer Statuses)
レイヤーの状態は、以下のいずれかのステータスとして管理・表示される。

| レイヤーステータス | 状態解説 |
|---|---|
| **Active (アクティブ)** | 処理を正常に実行中、または実行可能な正常稼働状態。 |
| **Idle (アイドル)** | 待機状態。エラーはなく、パイプラインのトリガーを待っている状態。 |
| **Warning (警告)** | 一時的な接続タイムアウトや遅延が発生しているが、動作は継続可能。 |
| **Error (エラー)** | 重大な処理失敗、ファイル破損、またはGAS API通信断絶により処理が中断した状態。 |
| **Disabled (無効)** | 管理ポリシーまたは保守作業によって、一時的にパイプライン適用からバイパス（除外）されている状態。 |

---

## 状態データモデル (Status Model Schema)
ダッシュボードが購読する状態オブジェクトの構造。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "KernelStatusReport",
  "type": "object",
  "properties": {
    "timestamp": { "type": "string", "format": "date-time" },
    "layers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "layerName": { "type": "string" },
          "status": {
            "type": "string",
            "enum": ["Active", "Idle", "Warning", "Error", "Disabled"]
          },
          "version": { "type": "string" },
          "health": { "type": "number", "minimum": 0, "maximum": 1 },
          "lastExecution": { "type": "string", "format": "date-time" },
          "lastUpdate": { "type": "string", "format": "date-time" }
        },
        "required": ["layerName", "status", "version", "health", "lastExecution", "lastUpdate"]
      }
    }
  },
  "required": ["timestamp", "layers"]
}
```
