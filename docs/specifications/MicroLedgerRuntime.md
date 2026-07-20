# AIOS Micro Ledger Runtime Specification (Sprint G7-4)

本稿は、AIOS Generation 7 マイクロカーネルにおける「台帳記録レイヤー（Micro Ledger Runtime）」の設計仕様書です。

---

## 1. 役割と責務 (Role & Responsibility)
1. **事実の記録層 (Fact Recording Layer)**:
   `DecisionCoordinator` から受け取った承認済みの調停結果（`CoordinationResult.accepted === true`）を、改ざん不能な不変エントリ（`LedgerEntry`）としてインメモリに永続化し、監査や推論の単一の事実源（Single Source of Truth）を構成します。
2. **監査・判定の非内包 (No Governance / No Replay)**:
   本ランタイムは、台帳データの正当性評価、ガバナンス憲法違反判定、リプレイ処理などは担当しません。純粋な「ブロック記録」のみを単一の責務（One Sprint = One Responsibility）とします。
3. **ハッシュチェーン整合性 (Cryptographic Linkage)**:
   すべてのエントリを直前のブロックのハッシュ（`currentHash`）と SHA-256 で暗号論的に連結（ハッシュチェーン構造）し、歴史的順序の保証と改ざん検知を可能にします。

---

## 2. 台帳連結フロー (Recording Flow)

```
        CoordinationResult
                 │
                 ▼
     [ MicroLedger.append() ]
                 │
      [ accepted === true ? ]  ──> false の場合は記録拒否 (Contract-01)
                 │
                 ▼
     [ Dynamic Protocol Match ] ──> coordinationId からプロトコル/バージョンを取得
                 │
                 ▼
      [ Stable Payload Hash ]  ──> パイプ区切りの固定シリアライズ入力から生成
                 │
                 ▼
      [ Generate Block Hash ]  ──> previousHash + payloadHash + メタデータ
                 │
                 ▼
     [ Update LedgerChain State ] ──> entryCountインクリメント、latestHash更新
                 │
                 ▼
       Immutable LedgerEntry
```

---

## 3. ハッシュ入力の安定性ポリシー (Stable Hash Policy)

JavaScript オブジェクト（JSON）のシリアライズにおけるキーの順序依存性を排除し、将来的なプラットフォーム・ランタイム環境間での決定論的なハッシュ一致を保証するため、ハッシュ化前に入力データを明示的に定義された固定順序でパイプ（`|`）連結します。

* **`payloadHash` のシリアライズ仕様**:
  `coordinationId:${coordinationId}|accepted:${accepted}|nextStage:${nextStage}|targetAgents:${targetAgentsStr}|errors:${errorsStr}`
* **`currentHash` のシリアライズ仕様**:
  `${previousHash}|${payloadHash}|${timestamp}|${protocolId}|${protocolVersion}`

---

## 4. 将来的な拡張ポイント (Future Audit Extensions)

将来的な監査ランタイム（Audit Runtime）や他ブロックチェーン・外部DB接続を見据え、以下のスロットを設計上の拡張余地として予約します。
* `metadataHash`: 追加の署名者スタンプや環境状態を格納するハッシュスロット。
* `runtimeVersion`: 生成時の AIOS カーネルランタイムのシステムバージョン。
* `LedgerRebuilder`: `LedgerChain` の全ハッシュチェーン整合性を監査・再計算するための検証モジュール。
