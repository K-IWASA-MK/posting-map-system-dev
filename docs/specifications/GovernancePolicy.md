# Governance Policy 仕様書

## 概要
本仕様書は、AIOS プラットフォームにおける統治ポリシー（Policy Definition）のスキーマおよびスコープ継承ルールを規定します。

## ポリシースコープ区分 (Policy Scope)
適用範囲および重要性に基づいて以下のスコープを定義します。

- **GLOBAL**: プラットフォーム全体に適用される共通の大原則（例: 暗号化要求、認証必須化など）。
- **RUNTIME**: 各実行環境（Runtime）に適用される基本規約。
- **PLUGIN**: 外部プラグインおよびアドオンのサンドボックス結合の安全境界。
- **APPLICATION**: 特定のアプリケーションおよびビジネスロジックの動作適合要件。

## スコープ継承ルール (Scope Inheritance Rule)
下位スコープは、上位スコープのポリシーを自動的に継承し、累積されたポリシー全てを満たさなければなりません。

```
GLOBAL
  └─► RUNTIME
        └─► PLUGIN
              └─► APPLICATION
```

- **適用範囲例**:
  - `APPLICATION` スコープのコンポーネントを評価する場合、`GLOBAL`, `RUNTIME`, `PLUGIN`, `APPLICATION` のすべての活性ポリシーが適用されます。
  - `RUNTIME` スコープのコンポーネントを評価する場合、`GLOBAL`, `RUNTIME` のポリシーが適用されます（PLUGIN, APPLICATION 固有のものは適用外）。
- **優先順位（Priority）**: 同一スコープ内で複数ポリシーが重複する場合、`priority` 順（数値が小さいものを優先）で評価・解決されます。
