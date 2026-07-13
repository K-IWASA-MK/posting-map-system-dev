# カーネル呼び出し仕様書 (Kernel Invocation Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、CLIから要求された処理に基づいて個々のカーネルレイヤー（Execution, Review, Quality 等）をプログラムレベルで安全に呼び出し、制御を引き渡すためのリクエスト・レスポンスおよび例外伝播のデータ構造を規定する。

---

## 呼び出し原則 (Invocation Principles)
- **判断の排除 (No Dispatch-time Decisions)**:
  - カーネル呼び出しインターフェース（Kernel Invocation）は、パラメータを受け渡してエンジンを起動し、その完了結果を返す「実行ブリッジ（Invocation Bridge）」である。
  - **呼び出し処理そのものが合否の判定（Quality判定）や、ガバナンス審査のスキップ許可などの判断を下してはならない。** 判断は必ず各エンジン本体のロジックに従う。

---

## 呼び出しデータモデル (Invocation Data Models)

### 1. 呼び出し要求 (Invocation Request)
エンジン起動時に引き渡される入力コンテキスト。
- `targetLayer`: 呼び出し先のエンジン識別名。
- `inputPayload`: エンジンが要求する入力パラメータ（JSONオブジェクト）。
- `runId`: 親となる `RunContext` の一意な実行ID。

### 2. 呼び出し結果 (Invocation Response)
エンジン処理完了時に返される結果オブジェクト。
- `status`: 呼び出し結果ステータス。
  - `Success`: 正常完了。
  - `Failed`: 処理失敗。
- `outputPayload`: エンジンが生成した出力データ（JSONオブジェクト、例: `QualityScoreRecord` 等）。
- `errorDetail`: 失敗（Failed）時に付与されるエラー情報。

---

## 例外およびエラー伝播 (Error Handling Schema)
カーネル呼び出しで例外が発生した際の共通レスポンス構造。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "KernelInvocationResult",
  "type": "object",
  "properties": {
    "runId": { "type": "string" },
    "targetLayer": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["Success", "Failed"]
    },
    "outputPayload": { "type": "object" },
    "errorDetail": {
      "type": "object",
      "properties": {
        "code": { "type": "string" },
        "message": { "type": "string" },
        "stackTrace": { "type": "string" }
      },
      "required": ["code", "message"]
    }
  },
  "required": ["runId", "targetLayer", "status"]
}
```
