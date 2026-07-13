# Validation Pipeline Foundation Specification (バリデーションパイプライン基盤仕様書)

## 1. Validation Flow (バリデーションフロー)
本アーキテクチャは、APIルーティング層の直前で機能し、HTTP リクエストの構造、メソッド、バージョン、登録ルート、および機能トグルを決定論的に検証して防御するフェイルファスト（Fail-Fast）パイプラインです。

```
[ApiRequest]
     │
     ▼
[ValidationPipeline] ──► (Valid: true) ──► [ApiRouter]
     │
     └──► (Valid: false) ──► [ValidationException] ──► [doGet / doPost] ──► [ApiResponse] (400/404/405/422)
```

---

## 2. Validator Chain & Validator IDs (バリデーターチェーンと識別子)
すべてのバリデーターは一方向かつ独立して動作し、互いの存在を知りません。各バリデーターは、監査およびメトリクス計測のために一意の `Validator ID` を有します。

| Validator 実行順 | クラス名 | Validator ID | 検証項目 / 失敗時のエラーコード | 返却ステータスコード |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `RequestValidator` | `REQUEST_VALIDATOR` | method/path/requestId 存在確認 (`INVALID_REQUEST`) | 400 Bad Request |
| 2 | `MethodValidator` | `METHOD_VALIDATOR` | GET/POST/PUT/DELETE 以外の検証 (`INVALID_METHOD`) | 405 Method Not Allowed |
| 3 | `VersionValidator` | `VERSION_VALIDATOR` | バージョン文字列 (v2/future) 妥当性 (`INVALID_VERSION`) | 422 Validation Failed |
| 4 | `RouteValidator` | `ROUTE_VALIDATOR` | ルート定義が Registry に存在するか確認 (`ROUTE_NOT_FOUND`) | 404 Route Not Found |
| 5 | `FeatureValidator` | `FEATURE_VALIDATOR` | 機能トグル（mapbox 等）が有効か検証 (`FEATURE_DISABLED`) | 422 Validation Failed |

---

## 3. Validation Exception & Error Mapping (例外とステータスマッピング)
検証が失敗したとき、チェイン実行は即座に停止し（フェイルファスト）、`ValidationException` がスローされます。
この例外は、以下のエラーコードと HTTP ステータスコードのマッピングテーブルを内包し、呼び出し元（`doGet` / `doPost` レイヤー）で捕捉されて適切な `ApiResponse` エラーラッパーへ変換されます。

```typescript
const ERROR_STATUS_MAP: Record<string, number> = {
  'INVALID_REQUEST': 400,
  'INVALID_METHOD': 405,
  'INVALID_VERSION': 422,
  'ROUTE_NOT_FOUND': 404,
  'FEATURE_DISABLED': 422,
};
```
