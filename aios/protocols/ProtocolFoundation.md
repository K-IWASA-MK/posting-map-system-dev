# AIOS Protocol Foundation Specification (Generation 7)

本稿は、AIOS Generation 7 における「Protocol-Driven Microkernel」設計思想のコア規格書であり、知能エージェント間およびカーネルとの共通通信インターフェースを規定します。

---

## 1. 設計思想 (Core Philosophy)
1. **知能の非内包 (No Logic in Kernel)**:
   AIOSカーネル自身は「なぜ（Why）その決定が下されたか」について判断しません。知能や意味の解釈はすべて外部エージェント（LLM）に委譲されます。
2. **形式的・決定論的アサート (Deterministic Assertion)**:
   カーネルは、流通するメッセージ（JSON）がプロトコルに規定されたスキーマを満たしているか、また送信者がその操作権限（Capability）を有しているかのみを形式検証（Schema / Path Invariant Check）します。
3. **名詞の極小化 (Minimal Concepts)**:
   コードベースの肥大化を防ぐため、新規のクラス型を追加せず、既存オブジェクトのJSON表現および状態（State）のみでプロトコルを拡張します。

---

## 2. プロトコル一覧 (Protocol List)

| プロトコルID | スキーマファイル | 役割 | 主なデータ項目 |
|---|---|---|---|
| `aios-decision-v1` | `decision-v1.json` | 意思決定メッセージの表現 | ID, 実行主体, 操作スコア, 署名（Signatures） |
| `aios-consensus-v1` | `consensus-v1.json` | 合議・多数決セッションの合意 | セッションID, 対象判断ID, スコア比率, 最終Verdict |
| `aios-capability-v1` | `capability-v1.json` | エージェントの認可境界 | エージェントID, 許可パス, 許可能力（Capabilities） |
| `aios-ledger-v1` | `ledger-v1.json` | 台帳記録ブロックの保護 | インデックス, タイムスタンプ, 前ハッシュ, ペイロード |
| `aios-governance-v1` | `governance-v1.json` | 人間の約束（Promise）の管理 | Promise ID, Vision参照, 担当者, 監査者, ステータス |

---

## 3. バージョン管理方針 (Protocol Version Policy)

プロトコルは以下のバージョニング仕様に従って管理されます。

1. **メタデータフィールド**:
   すべてのプロトコルメッセージは、ルートに以下のフィールドを必須とします。
   * `protocolId`: 対象プロトコルのID（例: `aios-decision-v1`）
   * `protocolVersion`: セマンティックバージョニング形式（例: `1.0.0`）
   * `compatibleVersions`: 互換性のあるバージョン範囲（例: `["^1.0.0"]`）
2. **互換性評価**:
   バリデータランタイムは、受信したメッセージの `protocolVersion` が自身のサポートするスキーマ定義の `compatibleVersions` セマンティクスを満たしているかを検証します。
3. **v2以降への移行方針**:
   破壊的変更がある場合は、新しく `decision-v2.json` スキーマを定義し、`protocolId` を `aios-decision-v2` とすることで、同一ポート上で新旧プロトコルの混在を許容します。

---

## 4. 拡張ルール (Extensibility Rules)

プロトコルのスキーマを拡張する際は、以下の制約を厳守してください。

* **JSON Schema 互換**:
  すべてのプロトコルは、`draft-07` に準拠した JSON Schema ファイルとして定義されなければなりません。
* **新規クラスの禁止**:
  オブジェクト指向プログラミングにおける新規クラスの作成を避け、プロトコルの拡張はメッセージ内の `payload` などのオブジェクトフィールドに新しい構造をシリアライズすることで表現します。
* **カーネルの疎結合保護**:
  新しいプロトコルメッセージが追加された場合でも、マイクロカーネル（`router.ts`, `validator.ts`）に個別のビジネスロジックを追加せず、汎用の JSON Schema バリデータによって一元検証される設計を維持します。
