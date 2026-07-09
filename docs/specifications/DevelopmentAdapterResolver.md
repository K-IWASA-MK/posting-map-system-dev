# Development Adapter Resolver Specification

## 1. Overview
Adapter Resolver は、Capability に対して最適な具象 ToolAdapter (Antigravity, Claude, Gemini, OpenAI) を決定論的に解決・取得するための抽象解決レイヤーです。  
Development OS は個別の具象 Adapter やそれらが内包するモデル情報を直接知らず、Adapter Resolver を唯一の入口（Single Entry Point）として利用して、最適な ToolAdapter を解決・取得します。

---

## 2. Core Concepts & Enums

### 2.1 ResolutionPolicy (Enum)
解決時の選択ルールを表現します。
* `FIXED`: 強制固定。ポリシー適用時、最優先で選択されます。
* `PREFERRED`: 第一候補。ポリシーが有効な中で優先選択されます。
* `FALLBACK`: フォールバック。主候補が利用不可能な場合に選ばれます。
* `DISABLED`: 無効。選択から完全に除外されます。

### 2.2 AdapterType (Enum)
アダプターの具象種別を型定義レベルで明確化し、具象クラス自体への依存を排除します。
* `ANTIGRAVITY`: Antigravity (IDE / MCP / Utility) アダプター。
* `CLAUDE`: Claude (LLM) アダプター。
* `GEMINI`: Gemini (LLM) アダプター。
* `OPENAI`: OpenAI (LLM) アダプター。

### 2.3 ResolutionReason (属性値)
解決結果に対する監査証跡向上のため、監査・判断理由の文字列（例: `"Highest Priority"`, `"Fallback"`, `"Pipeline Match"` 等）を保持します。

---

## 3. Resolution Priority Rule (解決優先ルール)
同一の Capability に対して複数の `ResolutionRecord` が登録されている場合、以下の優先ルールで単一の Adapter が決定論的に解決されます。

1. **ResolutionPolicy**: `FIXED` ➔ `PREFERRED` ➔ `FALLBACK` の順で適用。`DISABLED` はスキップ。
2. **Priority**: 同一 Policy 内では、`priority` 属性の数値が高いものが優先される。
3. **Registry Order**: 上記条件がすべて等しい場合、先に登録されたレコードが決定論的に選ばれる。

---

## 4. Four-Layer Resolution Flow (4層解決フロー)
`DevelopmentRules` は、Capability に関連付けられた Pipeline の解決情報から、具象アダプターまでを Adapter Resolver を仲介して一括で静的に解決・追跡します。

```
Development OS (DevelopmentRules)
      │
      ▼
Capability
      │
      ▼
Pipeline
      │
      ▼
ToolAdapter (抽象型)
      │
      ▼
AdapterResolver (解決エンジン)  ➔  Resolution Registry
                                           │
                                           ▼
                                 [Concrete Adapter]
                                 ├── AntigravityAdapter
                                 ├── ClaudeAdapter
                                 ├── GeminiAdapter
                                 └── OpenAIAdapter
```
---

## 5. Data Structure & Metadata

### 5.1 ResolutionRecord (解決レコード構造体)
* **`resolutionId`**: `resolution-1`, `resolution-2` 等の単調増加ID。
* **`capabilityId`**: 対象の Capability ID。
* **`pipelineId`**: 対象の Pipeline ID。
* **`adapterId`**: 解決対象の具象 Adapter ID。
* **`adapterType`**: `AdapterType` の Enum 値。
* **`priority`**: 解決の優先度（数値）。
* **`resolutionPolicy`**: `ResolutionPolicy` の Enum 値。
* **`resolutionReason`**: 解決理由の説明テキスト。
* **`resolutionState`**: レコード状態（ACTIVE, INACTIVE, DEPRECATED, EXPERIMENTAL）。
* **`version`**: レコードのセマンティックバージョン。
* **`createdAt`**: 生成日時。
* **`updatedAt`**: 最終更新日時。
