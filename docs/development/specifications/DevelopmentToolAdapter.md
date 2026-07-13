# Development Tool Adapter Specification

## 1. Overview
Tool Adapter は、Development OS の各種オーケストレーション定義（Pipeline 等）と、具象的な外部実行環境（IDE, LLM, Git, Shell, Browser 等）を接続するための抽象仲介レイヤーです。  
本モジュールは Tool/Adapter のメタデータの管理および静的解決のみを責務とし、具象接続の実装や Tool の実実行ロジックは一切含みません。

---

## 2. Core Concepts & Enums

### 2.1 ToolCategory (Enum)
外部ツールの種別を管理します。
* `IDE`: エディタ、コード編集環境
* `LLM`: AI言語モデル
* `VersionControl`: Gitなどのバージョン管理
* `Shell`: コマンドライン実行環境
* `Browser`: ブラウザ閲覧・操作
* `FileSystem`: ファイル入出力
* `MCP`: Model Context Protocol サーバー
* `Other`: その他外部連携ツール

### 2.2 ToolStatus & ToolAdapterStatus (Enums)
ツールおよびアダプターのステータス管理を対称に行います。
* `ACTIVE`: 利用可能。
* `INACTIVE`: 一時停止。
* `DEPRECATED`: 非推奨。
* `EXPERIMENTAL`: テスト運用中。

---

## 3. Dependency Simplification (依存関係の簡素化)
依存方向の単一化を維持するため、`ToolAdapter` は `Capability` や `Skill` の ID は直接保持せず、`supportedPipelineIds` および `supportedToolIds` のみを参照します。  
`Capability` や `Skill` への参照が必要な場合は、`Pipeline` オブジェクトから上流へ遡る（Pipeline ➔ Skill ➔ Capability）形で静的に解決します。

```
Capability
    ↑
  Skill
    ↑
Pipeline  ➔ supportedPipelineIds
             ↓
        ToolAdapter ➔ supportedToolIds ➔ Tool
```

---

## 4. Data Structure & Metadata

### 4.1 Tool (ツール定義体)
* **`toolId`**: `tool-1`, `tool-2` 等の単調増加ID。
* **`toolName`**: ツールの一意名称。
* **`category`**: `ToolCategory` の Enum 値。
* **`description`**: 説明テキスト。
* **`status`**: `ToolStatus` の Enum 値。
* **`version`**: ツールのセマンティックバージョン。
* **`createdAt`**: 生成日時。
* **`updatedAt`**: 最終更新日時。

### 4.2 ToolAdapter (抽象アダプター構造体)
* **`adapterId`**: `adapter-1`, `adapter-2` 等の単調増加ID。
* **`adapterName`**: アダプターの一意名称。
* **`description`**: アダプターの説明。
* **`supportedPipelineIds`**: アダプターが実行可能な Pipeline ID のリスト。
* **`supportedToolIds`**: アダプターが仲介する Tool ID のリスト。
* **`status`**: `ToolAdapterStatus` の Enum 値。
* **`version`**: アダプターのセマンティックバージョン。
* **`createdAt`**: 生成日時。
* **`updatedAt`**: 最終更新日時。
