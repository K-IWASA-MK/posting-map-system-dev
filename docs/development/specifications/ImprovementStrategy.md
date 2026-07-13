# 改善戦略仕様書 (Improvement Strategy Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、改善実行時に「どれほどの範囲と深度で変更を許容するか」の行動基準となる改善戦略（Improvement Strategy）の定義および将来的な拡張構造を規定する。

---

## 改善戦略 (Strategies)

### 戦略01 (Strategy 01): 最小変更 (Minimal Change)
- **概要**: 変更に伴うデグレードのリスクを徹底的に抑え、局所的な問題解決のみを行う。
- **行動規律**:
  - 行数・文字数の追加を最小限に留める。
  - リファクタリングやコードの再構成は一切行わず、問題の原因である1点のみをピンポイントで修正する。
  - 主にリスクが `High` になり得るホットなコアモジュールの緊急修正や、P1の緊急バグ修正に適用される。

### 戦略02 (Strategy 02): バランス (Balanced)
- **概要**: プロダクトの品質向上効果と、変更リスクのバランスを考慮して修正を行う。
- **行動規律**:
  - 対象ファイル周辺の小さなモジュールリファクタリングや、不要コードの削除を伴う修正を許容。
  - フロントエンドのコンポーネント書き換えやGASの関数分割など、安全性が保証できる範囲での最適な構成変更を実行。
  - AIOSの標準（デフォルト）戦略として採用される。

### 戦略03 (Strategy 03): 品質最優先 (Aggressive)
- **概要**: 変更リスクを厭わず、システムのアーキテクチャ純度、UX品質の最大化、および AI Smell の完全排除（Level 0到達）を最優先する。
- **行動規律**:
  - 既存ファイルの構造的書き換え、複数の依存モジュールの一括リファクタリング、および非効率なレガシーコードの全面再構築を推奨する。
  - 新機能追加時や、長期スプリントの初期フェーズでの広範なリファクタリングに適用される。

---

## 将来の戦略追加を考慮した拡張構造 (Future Extensions)
改善戦略は、将来的な開発で新しいアプローチ（例: セキュリティ強化戦略、PWA最適化戦略等）を追加できるよう、戦略判定部（Improvement Strategy Selector）と実行指令が以下のインターフェースで疎結合化されて定義される。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ImprovementStrategyDefinition",
  "type": "object",
  "properties": {
    "strategyName": { "type": "string" },
    "description": { "type": "string" },
    "allowRefactoring": { "type": "boolean" },
    "maxFilesModified": { "type": "integer" },
    "riskThreshold": { "type": "string", "enum": ["Low", "Medium", "High"] }
  },
  "required": ["strategyName", "allowRefactoring", "maxFilesModified", "riskThreshold"]
}
```
これにより、新たな戦略定義を追加する際も、コアコードを改変することなく、JSON設定によるポリシー拡張が可能となる。
