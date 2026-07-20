# AIOS Schema Validation Runtime Specification (Sprint G7-2)

本稿は、AIOS Generation 7 マイクロカーネルにおける「形式検証レイヤー（Schema Validation Runtime）」の設計仕様書です。

---

## 1. 役割と責務 (Role & Responsibility)
1. **形式検証の唯一の実行主体**:
   受信メッセージ（JSON）の構造、必須項目、データ型、値の制約が、G7-1 で確定したプロトコル定義（`protocols/*.json`）に完全に適合しているかを決定論的に保証します。
2. **知能の非内包 (Stateless / Non-Cognitive)**:
   本ランタイムは、メッセージのセマンティクス（意味）、合議、権限（Capability）、憲法適合、および台帳記録といった論理判定は行いません。それらは後続スプリント（G7-3 〜 G7-5）の担当領域です。

---

## 2. 検証フロー (Validation Flow)

```
        Incoming Message (JSON)
                  │
                  ▼
         [ ProtocolRegistry ]  <──> スキーマ物理絶対パスの解決
                  │
                  ▼
            [ Load Schema ]
                  │
                  ▼
           [ Version Check ]   <──> セマンティックバージョニング互換性確認
                  │
                  ▼
          [ Required Check ]   <──> 必須フィールドの存在確認
                  │
                  ▼
            [ Type Check ]     <──> string, number, array, object 等の型適合
                  │
                  ▼
     [ Pattern/Enum/Const Check ]  <──> 正規表現、列挙値、定数アサーション
                  │
                  ▼
      ValidationResult (Immutable)
```

---

## 3. サポートするスキーマ機能 (Supported Features)

カーネルコードの極小化（Microkernel）を維持し、外部パッケージへの依存を排除するため、AIOSが自律開発で使用するJSON Schema仕様の以下のサブセットのみをサポートします。

* **`type`**: `string`, `number`, `array`, `object` の厳密な検証。
* **`required`**: 必須項目の存在検証（`undefined` や `null` の排除）。
* **`pattern`**: 文字列型に対する正規表現（RegExp）マッチング検証。
* **`enum`**: 列挙値アサーション。
* **`const`**: 定数値アサーション。
* **`items`**: 配列内のオブジェクトのネスト検証（再帰呼び出し）。

---

## 4. バージョニング互換性規則 (SemVer Caret Rules)

本ランタイムは、以下のセマンティック・バージョン比較仕様をビルトインで提供します。
* メッセージに指定された `protocolVersion` が、レジストリに登録された `compatibleVersions`（例: `^1.0.0`）に適合しているかを検証します。
* ケアット（`^`）規則により、メジャーバージョン（左端の非ゼロ桁）の境界を越える更新は非互換（Rejection）とされ、マイナー・パッチバージョンの上位互換性（`>=`）を保証します。
