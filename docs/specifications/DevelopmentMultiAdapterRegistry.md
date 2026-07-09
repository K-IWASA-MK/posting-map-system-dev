# Development Multi Adapter Registry Specification

## 1. Overview
Multi Adapter Registry は、Development OS におけるすべての ToolAdapter を一元管理するための統合レジストリ（Single Source of Truth）です。  
個別のアダプターレジストリ（Antigravity, Claude, Gemini, OpenAI）の上位レイヤーとして機能し、Adapter Resolver は本レジストリを介して対象アダプターの探索・解決を行います。  
これにより、今後新規アダプター（Ollama, Copilot, LM Studio 等）が追加された場合でも、本レジストリへの追加登録のみでシステム全体で静的解決可能となる拡張性を備えます。

---

## 2. Core Concepts & Enums

### 2.1 AdapterHealthStatus (Enum)
将来的な実行時・Runtime 接続層を見据えた、アダプターの健全性ステータス。
* `HEALTHY`: 正常稼働。
* `DEGRADED`: パフォーマンス低下または一時的な応答遅延。
* `UNAVAILABLE`: 利用不可（接続障害やレート制限）。
* `UNKNOWN`: 状態不明。

### 2.2 AdapterPriorityPolicy (Enum)
優先順位判定のためのポリシー定義。
* `FIXED`: 固定優先（最高優先）。
* `DYNAMIC`: 負荷・コスト等の動的解決候補（将来用）。
* `FALLBACK`: フォールバック候補。

### 2.3 AdapterCapabilityMatrix
Capability とサポートする Adapter の対応関係を表現する独立構造体。
```typescript
interface AdapterCapabilityMatrix {
  readonly capabilityId: string;
  readonly adapterIds: readonly string[];
}
```

---

## 3. Discovery API (探索・検索インターフェース)
レジストリは以下の Discovery API を提供し、Adapter Resolver や外部 UI からの検索に対応します。
* `findByCapability(capabilityId: string): AdapterRecord[]`
* `findByPipeline(pipelineId: string): AdapterRecord[]`
* `findByCategory(category: ToolCategory): AdapterRecord[]`
* `findByAdapterType(type: AdapterType): AdapterRecord[]`
* `findAll(): AdapterRecord[]`

---

## 4. Architectural Data Structure

### 4.1 AdapterRecord (アダプター登録レコード)
* **`adapterRecordId`**: `multi-adapter-1`, `multi-adapter-2` 等の採番ID。
* **`adapterId`**: 具象アダプターの ID（例: `adapter-1`）。
* **`adapterType`**: `AdapterType` Enum（`ANTIGRAVITY`, `CLAUDE`, `GEMINI`, `OPENAI`）。
* **`adapterCategory`**: `ToolCategory` Enum。
* **`priority`**: 解決の優先度（数値）。
* **`priorityPolicy`**: `AdapterPriorityPolicy` Enum。
* **`healthStatus`**: `AdapterHealthStatus` Enum。
* **`status`**: アダプター状態（`ToolAdapterStatus`）。
* **`supportedCapabilityIds`**: サポートする Capability ID の配列。
* **`supportedPipelineIds`**: サポートする Pipeline ID の配列。
* **`version`**: レコードバージョン。
* **`createdAt`**: 登録日時。
* **`updatedAt`**: 更新日時。
* **`registryMetadata`**: `RegistryMetadata` 同等メタデータ。
