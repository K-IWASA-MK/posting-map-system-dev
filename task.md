# タスクチェックリスト - Phase129: API Schema Analyzer Foundation

- [x] ① 仕様書 `docs/specifications/APISchemaAnalyzer.md` の新規作成
- [x] ② `src/api/` ディレクトリ配下の型・定義作成
  - [x] `APISchemaType.ts` (列挙型)
  - [x] `APISchema.ts` (インターフェース)
  - [x] `APIEndpoint.ts` (インターフェース)
  - [x] `APISchemaAnalyzerContext.ts` (インターフェース)
- [x] ③ `src/api/` ディレクトリ配下のエンジン・レジストリ・マッパー・マネージャ（空実装）作成
  - [x] `APISchemaAnalyzerEngine.ts` (インターフェース & 抽象クラス)
  - [x] `APISchemaRegistry.ts` (レジストリクラス)
  - [x] `APISchemaMapper.ts` (マッパーツールクラス)
  - [x] `APISchemaAnalyzerManager.ts` (マネージャクラス)
- [x] ④ `src/index.ts` の更新（エクスポートの追加）
- [x] ⑤ ビルド検証 (`npm run build`) の PASS 確認
- [x] ⑥ CIE 健全性検証 (`verify` および `doctor`) の PASS 確認
- [x] ⑦ 既存テスト (`pytest`) の PASS 確認
- [x] ⑧ `HANDOVER.md` の更新
- [x] ⑨ Git コミット (`CIE Phase 129: API Schema Analyzer Foundation`) の作成
