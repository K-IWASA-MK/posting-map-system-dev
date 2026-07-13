# コマンドモデル仕様書 (Command Model Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、CLIから入力される要求コマンドの種類、対応パラメータ、アクセス制限、および対象とする実行ターゲットレイヤーを決定論的に定義するデータスキーマを規定する。

---

## コマンドモデル設計原則 (Command Philosophy)
- **要求の表現**: コマンドモデルは「何をしたいか（要求内容）」を表現するデータ構造であり、**実行権限の昇格やガバナンスポリシーをバイパスする情報は内包しない。**

---

## コマンド定義メタデータ (Command Fields)
各コマンドオブジェクトは、以下の項目で構成される。

- **Command ID**: コマンドに付与される不変の一意なID（例: `CMD-001`）。
- **Command Name**: コマンドの文字列（例: `run-pipeline`）。
- **Target Layer**: 処理の起点となるターゲットのカーネルレイヤー（例: `AIOS Kernel Pipeline` / `Knowledge Optimization`）。
- **Parameters**: 実行時に渡される引数のスキーマ定義（例: 対象ファイルパス、コミットハッシュ等）。
- **Permission**: コマンド実行に必要とされるユーザーロール（例: `Developer` / `Operator`）。
- **Execution Mode**: 実行形態の指定。
  - `Sync`: 同期実行（結果が返るまで呼び出し元をブロック）。
  - `Async`: 非同期実行（呼び出しは即時終了し、バックグラウンドタスクとして進行）。

---

## 主要コマンドの定義例 (Examples)

### CMD-001: run-pipeline
- **Name**: `run-pipeline`
- **Target**: `AIOS Kernel Pipeline`
- **概要**: コミット差分（Diff）に対して、Execution から Output に至る一連の検証・改善パイプラインを順次実行する。

### CMD-002: optimize-knowledge
- **Name**: `optimize-knowledge`
- **Target**: `Knowledge Optimization`
- **概要**: ナレッジベースの健全性分析と統合・ギャップの抽出処理を手動起動し、最適化レポートを生成する。

---

## コマンドデータ構造 (Command Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CommandRecord",
  "type": "object",
  "properties": {
    "commandId": { "type": "string" },
    "commandName": { "type": "string" },
    "targetLayer": { "type": "string" },
    "parameters": {
      "type": "object",
      "properties": {
        "commitHash": { "type": "string" },
        "targetPath": { "type": "string" }
      }
    },
    "permission": {
      "type": "string",
      "enum": ["Developer", "Operator", "Administrator"]
    },
    "executionMode": {
      "type": "string",
      "enum": ["Sync", "Async"]
    }
  },
  "required": ["commandId", "commandName", "targetLayer", "permission", "executionMode"]
}
```
