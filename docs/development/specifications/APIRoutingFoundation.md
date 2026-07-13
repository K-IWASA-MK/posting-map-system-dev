# API Routing & Endpoint Foundation Specification (API ルーティング＆エンドポイント基盤仕様書)

## 1. Routing Architecture (ルーティング・アーキテクチャ)
本アーキテクチャは、HTTP 物理環境（GAS）の依存を完全に隔離し、エンドポイント単位でバージョン管理およびリクエスト／レスポンスを標準化する API ルーティングレイヤーです。

```
[doGet() / doPost()] (GAS physical layer)
         │
         ▼ (ApiRequest parse)
    [ApiRouter]
         │
         ▼ (Route Resolver & RouteKey: "METHOD:VERSION:PATH")
  [EndpointRegistry]
         │
         ├──► (Route found) ─────► [EndpointHandler] ──► [ApiResponse]
         └──► (Route not found) ──► [UnknownEndpointHandler] (404)
```

---

## 2. API Request & Response Specification (不変オブジェクト規約)

### ApiRequest
* **イミュータブル性**: 作成後に値の変更はできません。
* **プロパティ**:
  - `method`: HTTP メソッド（GET | POST | PUT | DELETE）
  - `path`: リクエストパス（`/dashboard`, `/holding` 等）
  - `version`: API バージョン（`v1` | `v2` | `v3`）
  - `query`: クエリパラメータの Record マップ
  - `body`: リクエストボディの Object マップ
  - `headers`: リクエストヘッダーの Record マップ
  - `requestId`: 実行コンテキストに紐付くリクエスト識別子

### ApiResponse
* **標準レスポンスフォーマット**:
  - `status`: HTTP ステータスコード（200 | 400 | 404 | 405 | 500）
  - `success`: 処理成否フラグ
  - `data`: 処理ペイロード
  - `error`: エラーオブジェクト（`code`, `message`）
  - `metadata`: 実行時間・タイムスタンプ・バージョン統計

---

## 3. RouteKey & Endpoint Registration (ルート解決ルール)
* **RouteKey 形式**: `${method}:${version}:${path}` の文字列として正規化し、ルーターのディスパッチ処理を $O(1)$ のルックアップに最適化します。
* **EndpointHandler インターフェース**:
  ```typescript
  export interface EndpointHandler {
    execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse;
  }
  ```
  S3-1 で構築した `ApiExecutionContext` を第二引数（Handler Context）として接続可能にし、性能分析やトレースを安全に受け取ります。

* **UnknownEndpointHandler (404 / 405 処理)**:
  - ルートが見つからない場合は `UnknownEndpointHandler` へフォールバックし、統一された `404 Route Not Found` または `405 Method Not Allowed` 応答を生成します。
