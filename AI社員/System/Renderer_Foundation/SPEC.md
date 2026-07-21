# Google Workspace Renderer Foundation v1.0 - SPEC Specification

System: POSTING MAP / FIELD OPERATIONS OS
Author: 岩佐CEO / AI Director
Status: STABLE RELEASE (v1.0.0)

---

## ■ Mission (目的)
`AI Workforce Constitution v1.4.0` (Rendering Contract Standard v1.0) に準拠し、特定プラットフォーム（GAS, Excel, PDF 等）の API を `IRenderer` インターフェースで完全に隠蔽し、スタイル・レイアウトを含む全描画要求を宣言型 `RENDERING_CONTRACT.json` に従って決定論的・非侵襲的にレンダリングする描画エンジンの設計仕様。

---

## ■ Core Architecture Components

```
Master Artifacts (district_profile.json, address_database.json)
        │
        ▼
Rendering Contract (RENDERING_CONTRACT.json: data/style/layout mappings)
        │
        ▼
MasterArtifactLoader & RenderingContractLoader
        │
        ▼
RenderExecutor (No business logic / Pure Renderer Orchestrator)
        │
        ▼
IRenderer Interface (Platform Abstraction)
        ├── GoogleSheetsRenderer
        ├── CsvRenderer
        └── (Future: ExcelRenderer, PdfRenderer)
```

---

## ■ Key Principles
1. **Platform API Encapsulation**: AI-0003 は `SpreadsheetApp` や `setValues` を直接知らず、`IRenderer` インターフェースのみを操作する。
2. **Declarative Style & Layout**: 背景色・フォント・行高さ・列幅・隠し列制御をすべて `RENDERING_CONTRACT.json` へ移し、専用装飾コードを完全排除。
3. **Single Source of Truth**: 正本データをそのまま読み込み、再計算・補正・独自カウントを行わない。
