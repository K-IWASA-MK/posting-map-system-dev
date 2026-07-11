# Feature Access Control Foundation Specification (Sprint 4 Phase S4-4)

## 1. 概要
本設計書は、POSTING MAP API パイプラインにおける機能利用可否制御（Feature Access: **Can this feature be used?**）の基盤仕様を定義します。

認証・認可・ライセンスの結果とシステムトグルを統合し、リクエスト対象機能に対する利用要件を満たしているかを判定します。

## 2. 処理の順序とパイプライン配置
API リクエスト処理フローにおいて、`LicensingPipeline` の直後、`ValidationPipeline` の前段に配置します。

```
HTTP Request
     │
     ▼
HardeningPipeline
     │
     ▼
AuthenticationPipeline
     │
     ▼
AuthorizationPipeline
     │
     ▼
LicensingPipeline
     │
     ▼
FeatureAccessPipeline ── (利用不可時は 403 遮断)
     │
     ▼
ValidationPipeline
     │
     ▼
ApiRouter
     │
     ▼
EndpointHandler
```

---

## 3. 機能定義と可否状態

### 3.1 Feature (機能)
制御対象となるプロダクト機能一覧。
* `GOOGLE_MAPS`: Google Maps 表示/Geocoding。
* `MAPBOX`: Mapbox 表示/経路検索。
* `AIOS_BRIDGE`: AIOS 連携/通知。
* `REALTIME_DASHBOARD`: リアルタイムダッシュボード閲覧。
* `ANALYTICS`: 稼働・ポスティング分析。
* `REPORTS`: 日報・実績エクスポート。
* `EXPORT`: データCSV/JSONダウンロード。
* `FIELD_MONITORING`: 配布員現在地監視。

### 3.2 FeatureAvailability (利用可能状態)
* `AVAILABLE`: 利用可能。
* `DISABLED`: システムトグル、またはフィーチャトグルにより無効化。
* `LICENSE_REQUIRED`: 必要とされる Edition プラン未満。
* `NOT_AUTHORIZED`: 認可ロール、権限、スコープの不足。
* `NOT_SUPPORTED`: 未サポート。

---

## 4. 判定順序とフェイルファスト (Fail-Fast Rule)
`FeatureAccessPipeline` は、以下の順序でポリシー要件を確認し、不適合があった時点でただちに対応する `FeatureException` を投げて処理を遮断（フェイルファスト）します。

```
[Start Feature Evaluation]
            │
            ▼
    [Feature Toggle] ───── 無効 ──► Throw PM-FEA-001 (FEATURE_DISABLED)
            │
            ▼
    [Edition check] ────── 不足 ──► Throw PM-FEA-002 (LICENSE_REQUIRED)
            │
            ▼
   [Role/Perm/Scope] ───── 不足 ──► Throw PM-FEA-003 (PERMISSION_REQUIRED)
            │
            ▼
        [Success]
```

---

## 5. エラーコード定義

| エラーコード | 例外名称 | 原因 / 内部メッセージ | HTTP Status |
|---|---|---|---|
| `PM-FEA-001` | FEATURE_DISABLED | 機能トグル（Feature Flag）が無効化されている | 403 |
| `PM-FEA-002` | LICENSE_REQUIRED | エディションレベルが不足している | 403 |
| `PM-FEA-003` | PERMISSION_REQUIRED | 要求される認可ロール・権限が不足している | 403 |
| `PM-FEA-004` | FEATURE_NOT_AVAILABLE | 不明な機能、または利用不可 | 403 |
