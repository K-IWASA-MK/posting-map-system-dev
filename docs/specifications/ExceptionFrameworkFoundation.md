# Exception Framework Foundation Specification (例外処理基盤仕様書)

## 1. Exception Architecture (例外処理アーキテクチャ)
本フレームワークは、API 処理全体の各レイヤー（Validation, Routing, Handler）でスローされるすべての例外を、決定論的かつ一元的に処理するための例外処理基盤です。

```
[Request Processing Loop] (doGet / doPost)
       │ (try)
       ├──► [Validation Pipeline]
       ├──► [Route Resolver / Dispatcher]
       └──► [Endpoint Handler]
       │
       ▼ (catch)
[ExceptionHandler.handle(error, request, context)]
       │
       ├──► [Exception Event Hook] ──► (onException event to S3-5 Audit/Logs)
       │
       ▼
[ExceptionMapper.toResponse(error, request, context)] ──► [ApiResponse] (Standardized)
```

---

## 2. ApiException Base & Exception Code Registry (例外基底定義)
すべてのカスタム例外クラスは `ApiException` 抽象クラスを継承します。システムのエラーコード体系には、検索や分析を容易にするため一意のコード体系（例: `PM-VAL-001`）を割り当てます。

```typescript
export abstract class ApiException extends Error {
  public abstract readonly category: ExceptionCategory;
  public abstract readonly code: string;        // 固有のエラーコード (例: "PM-VAL-001")
  public abstract readonly status: number;      // HTTPステータスコード
  public readonly internalMessage: string;      // 内部詳細デバッグ用メッセージ
  public readonly externalMessage: string;      // 外部ユーザー向け安全メッセージ
  public readonly metadata: ExceptionMetadata;  // 例外発生時の監査用情報
}
```

---

## 3. Exception Category & Mapping Matrix (例外種別とステータスマッピング)

| 例外クラス | カテゴリ (`ExceptionCategory`) | エラーコード | 外部向けメッセージ (External) | 内部メッセージ例 (Internal) | HTTP ステータス |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ValidationException` | `VALIDATION` | `PM-VAL-001` | 入力パラメータの検証に失敗しました。 | Validation failed at REQUEST_VALIDATOR: ... | 422 |
| `RoutingException` (NotFound) | `ROUTING` | `PM-RTE-001` | 指定された API ルートが見つかりません。 | Route "GET /unknown" was not found. | 404 |
| `RoutingException` (MethodNotAllowed) | `ROUTING` | `PM-RTE-002` | 許可されない HTTP メソッドです。 | HTTP Method PATCH is not allowed by Policy. | 405 |
| `FeatureException` | `FEATURE` | `PM-FTR-001` | 指定された機能は現在無効化されています。 | Held Flyers feature is disabled. | 422 |
| `ConfigurationException` | `CONFIGURATION` | `PM-CFG-001` | システム設定エラーが発生しました。 | Google Maps API key (MAPS_API_KEY) missing. | 500 |
| `SystemException` | `SYSTEM` | `PM-SYS-001` | 予期しないエラーが発生しました。 | Null pointer / TypeError: cannot read ... | 500 |

---

## 4. Exception Event Hook (例外イベントフック)
`ExceptionHandler` にイベントフック用の拡張ポイント `onException` を配置します。S3-5 で予定されている `Monitoring & Audit` をこのフックに接続することで、コアな例外処理制御コードを変更することなく、例外発生の監視・通知をアドオンできます。
