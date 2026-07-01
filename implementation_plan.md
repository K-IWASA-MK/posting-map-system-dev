# Implementation Plan - Phase129: API Schema Analyzer Foundation

## 1. Architecture Goal
AI Development Platform (AIOS) において、外部および内部の API 構造を解析・抽象化するための **API Schema Analyzer** の構造・契約定義（Blueprint）を構築します。
本フェーズでは、実際の API 通信、HTTP リクエスト、外部からのスキーマフェッチ、ネットワークアクセス等の実行処理は一切行わず、API スキーマを「構造データ」として扱うためのデータ表現とインターフェースのみを定義します。

---

## 2. Design Principles
- **Blueprint Only**: 型、インターフェース、パーサー/マッパーの抽象シグネチャ定義に限定。
- **No API Calls / Network Access**: 実際の HTTP/HTTPS リクエストや外部通信は一切行わない。
- **No Schema Fetching Execution**: 外部サーバーからの OpenAPI/GraphQL スキーマのフェッチ処理は排除。
- **Stateless Design**: スキーマ解析エンジン自体は実行中の状態を持たない。
- **Deterministic Schema Representation**: 同一のスキーマ定義入力に対し、決定論的かつ一意な内部抽象モデルを返す設計。
- **Structure-First Modeling**: 実行処理ではなく、エンドポイントとデータ型の依存グラフ構築に専念。
- **Future OpenAPI / GraphQL Ready**: OpenAPI および GraphQL スキーマの表現に容易に拡張可能な抽象レイヤーの定義。

---

## 3. Specification Document [NEW]
- `docs/specifications/APISchemaAnalyzer.md`

---

## 4. TypeScript Blueprint
`src/api/` ディレクトリ配下に以下の構造定義ファイルを作成します。

1. **`APISchemaType.ts`**
   - 列挙型: `OPENAPI`, `GRAPHQL`, `REST`, `INTERNAL`, `MOCK`
2. **`APISchema.ts`**
   - インターフェース: `id`, `name`, `type`, `version`, `rawSchema`
3. **`APIEndpoint.ts`**
   - インターフェース: `path`, `method`, `parameters`, `requestBody`, `responseBody`
4. **`APISchemaAnalyzerContext.ts`**
   - インターフェース: `source`, `schemaId`, `runtimeId`, `analysisMode`, `timestamp`
5. **`APISchemaAnalyzerEngine.ts`**
   - インターフェース `IAPISchemaAnalyzerEngine` (メソッド: `analyze()`, `parse()`, `resolve()`, `validate()`)
   - 抽象クラス `BaseAPISchemaAnalyzerEngine` (空実装)
6. **`APISchemaRegistry.ts`**
   - クラス: `addSchema()`, `removeSchema()`, `findSchema()`, `listSchemas()` のシグネチャと空実装。
7. **`APISchemaMapper.ts`**
   - クラス: `mapEndpoints()`, `mapTypes()`, `buildGraph()` のシグネチャと空実装。
8. **`APISchemaAnalyzerManager.ts`**
   - クラス: `initialize()`, `analyze()`, `status()`, `shutdown()` のシグネチャと空実装。

---

## 5. Scope of Impact

### Allowed (変更許可)
- `docs/specifications/APISchemaAnalyzer.md`
- `src/api/*`
- `src/index.ts` (エクスポートの追加)

### Forbidden (変更禁止)
- 実際の HTTP 通信レイヤーの実装（axios, fetch 等の依存追加）。
- 外部エンドポイントからの OpenAPI 構造定義取得などの非同期フェッチ処理の実装。
- APIプロキシ、モックサーバーの実際のルーティング動作ロジック。
- データベース/永続化等によるスキーマ定義のファイル保存・永続化処理の実装。

---

## 6. Verification Plan (検証計画)
1. **ビルド検証**: `npx tsc --noEmit` または `npm run build`
2. **CIE 健全性検証**: `python3 tools/cie.py verify` / `python3 tools/cie.py doctor`
3. **既存テスト**: `.venv/bin/pytest`

---

## 7. Definition of Done
* [ ] `docs/specifications/APISchemaAnalyzer.md` の作成
* [ ] `src/api/*` の各種ファイル作成
* [ ] `src/index.ts` へのエクスポート追加と更新
* [ ] TypeScript ビルドが正常に PASS
* [ ] `python3 tools/cie.py verify` が正常に PASS
* [ ] `python3 tools/cie.py doctor` が正常に PASS
* [ ] `.venv/bin/pytest` が正常に PASS
* [ ] `HANDOVER.md` の更新
* [ ] ローカル Git コミットの作成（メッセージ: `CIE Phase 129: API Schema Analyzer Foundation`）
