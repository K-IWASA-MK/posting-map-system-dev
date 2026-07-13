# ガバナンスポリシー仕様書 (Governance Policy Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、システム全体の品質、ナレッジの適合率、および変更の安全性基準を大局的に規定・管理するためのガバナンスポリシー（Governance Policy）のライフサイクル、カテゴリ、および管理メタデータ項目を定義する。

---

## ポリシーカテゴリ (Policy Categories)
ガバナンスエンジンは、以下の主要なポリシーカテゴリを管理・監査する。

### 1. 知識ポリシー (Knowledge Policy)
- **概要**: ナレッジ（Knowledge）として登録・昇格するための最小合格基準、健康度（Health）の境界閾値、および重複判定基準を定義。
- **適用例**: 「Official への昇格には、2スプリント以上連続での $Delta >= 10.0$ 実績と、再現テスト PASS が必須である。」

### 2. 品質ポリシー (Quality Policy)
- **概要**: リリース合格（PASS）となるための最小総合スコア、および許容される AI Smell Level の最大値を定義。
- **適用例**: 「総合品質スコアは 80 以上、且つ AI Smell Level は 1 以下でなければならない。」

### 3. 開発ポリシー (Development Policy)
- **概要**: アーキテクチャ構成上の制約、レイヤー分離（Frontend と GAS backend 間の結合）、およびモジュール依存性の制限を定義。
- **適用例**: 「Frontend の HTML 内に GAS API 以外の Google 依存スクリプトを直接埋め込むことを禁止する。」

### 4. セキュリティポリシー (Security Policy)
- **概要**: 各 API エンドポイントや Spreadsheet へのアクセス権限、クライアントごとの認証・独占キー管理基準を定義。

### 5. 変更ポリシー (Change Policy)
- **概要**: 修正差分のリスク（Risk Assessment: Low/Medium/High）に応じた、人間承認（Approval Gate）の要否基準を定義。

### 6. ライセンスポリシー (License Policy)
- **概要**: 地域独占権限（独占契約地区外への配布マップ描画の禁止等）、利用期限チェック、およびブランチごとの操作・アクセス権限ポリシーを定義。
- **適用例**: 「MIE-03 ライセンス保有ブランチは、三重県第3区以外のエリアデータを取得・描画するAPIを実行してはならない。」

---

## ポリシーライフサイクル (Policy Lifecycle)
ポリシー定義は、安全な移行制御を確保するため、以下のステータス遷移を経て管理される。

```
[Draft (ドラフト草案)] ──(発効)──> [Active (適用稼働中)] ──(更新)──> [Deprecated (非推奨・警告期間)]
                                                                           │
                                                                           ▼
                                                                   [Archived (アーカイブ無効化)]
```

- **Draft (ドラフト)**: 新しいルールや変更案の起案段階。検証は行われるが、実システム判定には反映されない。
- **Active (有効)**: レビューおよび最適化の検証に適用される公式な稼働中ポリシー。
- **Deprecated (非推奨)**: 新ポリシーへの移行のため、警告を伴うが一時的に適合を許容する過渡状態。
- **Archived (無効化)**: 完全に適用から除外された過去のポリシー記録。

---

## ポリシー管理モデル (Policy Schema)
ポリシーオブジェクトの JSON 構造。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GovernancePolicyDefinition",
  "type": "object",
  "properties": {
    "policyId": { "type": "string" },
    "version": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["Draft", "Active", "Deprecated", "Archived"]
    },
    "category": {
      "type": "string",
      "enum": ["Knowledge", "Quality", "Development", "Security", "Change", "License"]
    },
    "scope": { "type": "string" },
    "effectiveDate": { "type": "string", "format": "date-time" },
    "rulesApplied": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["policyId", "version", "status", "category", "scope", "effectiveDate", "rulesApplied"]
}
```
