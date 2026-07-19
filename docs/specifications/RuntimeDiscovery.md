# Runtime Discovery 仕様書

## 概要
本仕様書は、Runtime Service Layer における、Runtime の動的探索（Discovery）および能力に基づく検索ロジックの定義を規定します。

## 動的検出機能 (Discovery Capabilities)
外部モジュールや他 Runtime は、直接参照を持たない代わりに `RuntimeDiscovery` を介して目的の能力を持つ Runtime を検索します。

### 1. 全登録一覧の取得 (Listing)
- 全てのアクティブな Runtime の `RuntimeDescriptor` を配列として取得します。

### 2. 能力ベース検索 (Capability-based Lookup)
- 指定された `RuntimeCapability`（例: `VALIDATION`, `CONSOLE`）を保有する Runtime のリストを抽出します。

### 3. タイプベース検索 (Type-based Lookup)
- 特定の Runtime 分類（例: `monitoring`, `learning`）に合致するものを抽出します。

---

## 検索用 API コントラクト
```typescript
export class RuntimeDiscovery {
  public discover(): RuntimeDescriptor[];
  public findByCapability(capability: RuntimeCapability): RuntimeDescriptor[];
  public findByType(runtimeType: string): RuntimeDescriptor[];
}
```
