# AIOS Agent Registry Specification (Sprint G7-6)

本稿は、AIOS Generation 7 ランタイムレイヤーにおける「宣言的メタデータ解決層（Agent Registry）」の設計仕様書です。

---

## 1. 役割と責務 (Role & Responsibility)
1. **宣言的エージェント辞書 (Declarative Agent Database)**:
   ランタイム（`aios/runtime/`）が生成した `ExecutionRequest` から、エージェントID（`agentId`）をキーとして、ロール名、プロンプトプロファイル、対応能力メタデータ、および許可されたツール群を一元的に解決します。
2. **静的レジストリ（Static & Immutable Registry）**:
   本レジストリは実行時（Runtime）に定義の追加や動的書き換えを行いません。型安全性の観点から内部構造は `ReadonlyMap<string, AgentDefinition>` として固定管理されます。
3. **能力（Capability）と実行権限（Permission）の分離**:
   `AgentCapability` はエージェントが備えている「能力（メタデータ）」を宣言するものであり、セキュリティ制御や実行の差し止めは行いません。Enforcement（強制）は後続レイヤーが担当します。
4. **決定論の維持 (Deterministic Lookup)**:
   キャッシュやセッションなどの状態を持たないステートレス設計（Contract-03）であり、同一のID解決に対して常に等価な `ResolvedAgent` 属性情報を返却します。

---

## 2. 解決フロー (Lookup Flow)

```
       ExecutionRequest (agentId)
                  │
                  ▼
         [ AgentRegistry.ts ]
                  │
        [ Validate Agent ID ] ──> 空IDや不正な要求は却下
                  │
                  ▼
      [ Lookup ReadonlyMap ]  ──> 静的登録テーブルからエージェント定義を検索
                  │
                  ▼
     [ Assemble ResolvedAgent ] ──> 静的プロファイル・メタデータをバインド
                  │
                  ▼
          ResolvedAgent
                  │
                  ▼
      Agent Communication Bus (G7-7)
```

---

## 3. 将来的な設計拡張ポイント (Architecture Extensibility)

将来の AIOS ランタイム拡張（G8以降）を見据え、本レジストリ設計には以下の拡張余地を組み入れています。

* **ツールID（`toolIds`）への抽象化**:
   現在はツール名を文字列配列（`allowedTools: readonly string[]`）として管理していますが、将来の Tool Registry 新設時にはツールオブジェクトをIDで紐づける `readonly toolIds: readonly string[]` へのマッピング移行を容易にします。
* **エージェント定義バージョン（`version`）**:
   同名のエージェント仕様のメジャー・マイナーバージョン管理（例: `Architect v1.0.0` から `Architect v2.0.0` への切り替え）を行えるよう、`AgentDefinition` に `version` パラメータを追加できるインターフェース設計を想定しています。
