# Development OpenAI Adapter Specification

## 1. Overview
OpenAI Adapter は、AIOS が利用する LLM Adapter の第三弾であり、OpenAI モデルのメタデータ定義をカプセル化する不変な抽象アダプターモデルです。  
本モジュールはメタデータの保持、静的解決、および依存関係の検証のみを責務とし、OpenAI API 呼び出しやネットワーク通信は一切含みません。

---

## 2. Core Concepts & Enums

### 2.1 OpenAIProvider (Enum)
提供・運用プラットフォームを識別します。
* `OPENAI`: OpenAI社による直接提供・ホスティング。
* `AZURE_OPENAI`: Microsoft Azure OpenAI Service を介した運用。

### 2.2 OpenAIModelStatus (Enum)
モデルの利用状態を管理します。（Claude / Gemini と完全に対称）
* `ACTIVE`: 利用可能
* `INACTIVE`: 一時停止
* `DEPRECATED`: 非推奨
* `EXPERIMENTAL`: 先行テスト運用中

---

## 3. Four-Layer Resolution Flow (4層の解決フロー)
依存方向 of the single directionを維持するため、`OpenAIAdapter` はモデル本体（オブジェクト構造）は直接保持せず、`supportedModelIds: readonly string[]` のみを保持します。  
`DevelopmentRules` は、Capability ➔ Pipeline ➔ ToolAdapter ➔ OpenAIAdapter ➔ OpenAIModelRegistry ➔ OpenAIModel に至る 4 層の階層構造を静的に解決・追跡します。

```
Development OS
      │
      ▼
Capability
      │
      ▼
Pipeline
      │
      ▼
ToolAdapter
      │
      ▼
OpenAIAdapter  ➔ supportedModelIds
                           │
                           ▼
                 OpenAIModelRegistry ➔ OpenAIModel
```
---

## 4. Data Structure & Metadata

### 4.1 OpenAIModel (モデル定義体)
* **`modelId`**: `openai-model-001` 等の安定した抽象ID。
* **`modelName`**: モデル名（例: `"gpt-4o"`）。
* **`provider`**: `OpenAIProvider` の Enum 値。
* **`modelVersion`**: モデルのセマンティックバージョン。
* **`description`**: モデルの説明テキスト。
* **`status`**: `OpenAIModelStatus` の Enum 値。
* **`createdAt`**: 生成日時。
* **`updatedAt`**: 最終更新日時。

### 4.2 OpenAIAdapter (抽象アダプター構造体)
* **`adapterId`**: `adapter-1`, `adapter-2` 等の単調増加ID。
* **`adapterName`**: アダプターの一意名称。
* **`description`**: アダプターの説明。
* **`supportedPipelineIds`**: アダプターが実行可能な Pipeline ID のリスト。
* **`supportedToolIds`**: アダプターが仲介する Tool ID のリスト（通常 `tool-openai`）。
* **`supportedModelIds`**: アダプターが実行可能な OpenAIModel ID のリスト。
* **`status`**: `ToolAdapterStatus` の Enum 値。
* **`version`**: アダプターのセマンティックバージョン。
* **`createdAt`**: 生成日時。
* **`updatedAt`**: 最終更新日時。
