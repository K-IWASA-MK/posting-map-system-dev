# AIOS Agent Communication Bus Specification (Sprint G7-7)

本稿は、AIOS Generation 7 ランタイムレイヤーにおける「通信バス基盤（Agent Communication Bus）」の設計仕様書です。

---

## 1. 役割と責務 (Role & Responsibility)
1. **インメモリメッセージ配送層 (In-Memory Transit Layer)**:
   解決済みエージェント（`ResolvedAgent`）間、およびランタイムモジュール間での不変メッセージパケット（`MessageEnvelope`）の配送・中継のみに専念します。
2. **通信と実行/状態管理の完全な分離**:
   メッセージのバッファリング、キュー永続化、再試行ループ（Retry）、およびエージェントプロセスの起動・実行は行いません。これらは後続の `Agent Scheduler` (G7-8) が担当します。
3. **キー順序ソートによる stable-hash messageId**:
   G7-4 で採用した台帳のシリアライズ安定化規則を継承し、ペイロード（`payload`）のオブジェクトキーをアルファベット順にソートした安定文字列から SHA-256 ハッシュを決定論的にアサートして `messageId` を構成します。

---

## 2. 配信フロー (Delivery Flow)

```
         ResolvedAgent (Source / Target)
                        │
                        ▼
         [ AgentCommunicationBus.ts ]
                        │
       [ Validate Source / Target Invariant ]
                        │
                        ▼
   [ Stable Stringify & SHA-256 Hashing ] ──> messageId, routeId の導出
                        │
                        ▼
       [ Build MessageEnvelope.ts ]
                        │
                        ▼
       [ Build DeliveryResult.ts ]
                        │
                        ▼
                 DeliveryResult
                        │
                        ▼
              Agent Scheduler (G7-8)
```

---

## 3. 将来的な設計拡張ポイント (Architecture Extensibility)

* **Message Types の規定**:
   `MessageEnvelope` の `messageType` は文字列として定義されていますが、将来的に以下の通信種別をサポートするための拡張用スロットを設けています。
  - `REQUEST`: 処理要求（返信を期待するメッセージ）。
  - `RESPONSE`: 要求に対する処理結果。
  - `EVENT`: 任意のエージェントに購読される出来事通知。
  - `NOTIFICATION`: 一方向の通知。
* **Clock Provider による日時検証**:
   `createdAt` および `deliveredAt` は通信バス上の過渡的なイベントメタデータ（台帳に永続化される監査ログとは異なります）として定義されます。
   テスト容易性向上のため、本仕様では固定日時を返却していますが、実運用時には差し替え可能な Clock Provider 抽象（`IClockProvider`）を導入して動的な現在時刻検証を統合できる設計とします。
