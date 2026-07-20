# Generation 7 Protocol Architecture Specification

本稿は、AIOS Generation 7 における「Protocol-Driven Microkernel」設計思想の全体像と構造定義、およびエージェントとランタイムの連携境界について規定した最上位仕様書です。

---

## 1. 全体構造 (G7 Layers)

AIOS G7 は、以下の7層の垂直スタックで構成されます。

```
     【HUMAN / BIOS】
    ┌────────────────┐
    │  Vision Layer  │ ──> Mission / Vision / Constitution (人間のみ変更可能)
    └────────────────┘
           │
           ▼
     【AIOS PROTOCOL】
    ┌────────────────┐
    │ Protocol Layer │ ──> aios/protocols/ (JSON Schema 規格群)
    ├────────────────┤
    │Governance Layer│ ──> aios/policies/ (Capability / Identity / Transaction)
    ├────────────────┤
    │  Micro Kernel  │ ──> aios/kernel/ (最小限のルーティング・検証ロジック)
    └────────────────┘
           │
           ▼
     【COGNITIVE AGENTS】
    ┌────────────────┐
    │  Agent Layer   │ ──> aios/agents/ (LLMエージェント社員: プロンプトと役割)
    ├────────────────┤
    │Knowledge Layer │ ──> aios/knowledge/, aios/patterns/ (エージェントの知的資産)
    └────────────────┘
           │
           ▼
     【DRIVERS / ENGINES】
    ┌────────────────┐
    │Execution Layer │ ──> OS外部基盤 (Git, Node, Filesystem, Browser Sandbox)
    └────────────────┘
```

---

## 2. Protocol の責務 (Protocol Responsibility)

* **知能の非内包**:
  プロトコルは、メッセージが「正しい構造（Schema）」と「正しい署名・権限スタンプ」を有しているかどうかの仕様のみを定義します。メッセージの意味（Semantic）や設計内容の優劣は一切関知しません。
* **共通言語の提供**:
  異種LLMや外部のカスタムエージェントが、同一のインターフェースで安全に協調するための「パブリック・プロトコル」として機能します。

---

## 3. Runtime / Agent / Kernel の関係と境界 (Boundaries)

### ① Kernel と Agent の境界 (The Microkernel Principle)
* **Kernel（総務）**: 知能を持たない極小（200〜500行）のシステムコール監視役。JSONのパース、スキーマ検証、権限（Capability）チェック、台帳（Ledger）書き込み、トランザクションのコミット/ロールバックのみを担当します。
* **Agent（知的な労働者）**: 実際の認知・推論・プランニング・コード設計・合議レビューを担当。エージェントはカーネル内にクラスやエンジンとして埋め込まれず、外部プロセスとしてプロトコルメッセージ（JSON）をカーネルと送受信します。

### ② Governance と Runtime の境界
* **Governance (Policy & Constitution)**:
  エージェントの行動が合議ルールや憲法（C-011, C-012など）に違反していないかを検証するポリシーレイヤー。
* **Runtime**:
  カーネルがメッセージを検証し、整合性が保たれた状態で実際に動作する隔離実行空間（Execution Layer）。

---

## 4. バージョン管理方針 (Versioning Policy)

* **Semantic Versioning**:
  すべてのプロトコルファイルは、ルートに `protocolId`, `protocolVersion`, `compatibleVersions` を必須パラメータとして含みます。
* **非破壊的拡張**:
  同一の `protocolId` を保ちながら、互換性のあるマイナーバージョン（例：`1.1.0`）を定義し、旧スキーマとの接続を維持します。
* **破壊的変更（v2）**:
  仕様に破壊的変更がある場合は、新しく `protocols/decision-v2.json` を定義し、`protocolId` を `aios-decision-v2` へ昇格。ポート上で新旧プロトコルのメッセージが安全に共存・競合しないように設計します。

---

## 5. 拡張ルール (Extension Rules)

* **No New Classes**:
  カーネル内に新しいTypeScriptクラス（例：`DecisionToken` などのオブジェクト記述モデル）を追加してはいけません。新しい概念の追加は、プロトコルメッセージ内の `payload` などの不透明オブジェクト内にデータ構造を拡張（シリアライズ）することで表現します。
* **Schema-Driven Validation**:
  プロトコルが追加・拡張された場合も、バリデータは汎用JSONスキーマ検証機（Validator）のみを使用し、個別のカスタムチェックロジックをカーネル内にコーディングすることは禁止します。
