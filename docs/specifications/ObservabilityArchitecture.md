# Observability Architecture 仕様書

## 概要
本仕様書は、可観測基盤が他プラットフォームモジュールや読み取り専用の Console と交差するシステム境界とデータフローを規定します。

## アーキテクチャ構成 (Observability Architecture)

```
[Runtime Service] ➔ (AIOSEvent) ➔ [AIOSEventBus]
                                      │
                                      ▼ (Subscribe)
                              [Telemetry Pipeline]
                                      │
                                      ▼ (Aggregate)
                          [Observability Runtime] (Projection)
                                      │
                                      ▼ (getProjection() / Read Model)
                              [Console Runtime]
```

## 結合ルール (Boundary & Coupling Rules)
1. **ランタイム直結の禁止**: Console Runtime は、他の Runtime を直接参照して状態をポーリングすることを厳格に禁止されます。
2. **イベント駆動の維持**: `ObservabilityRuntime` は EventBus のパッシブな購読者としてのみ機能し、他コンポーネントに対するアクティブな変更指示や Write API のコールバックを提供しません。
3. **射影不変性**: `ObservabilityRuntime` が外部に提供する Projection スナップショットは、`deepFreeze` により不変（Read-Only）として凍結されます。
