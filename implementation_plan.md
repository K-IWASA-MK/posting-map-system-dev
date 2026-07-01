# Implementation Plan - Phase127: Governance Event Bus Foundation

## 1. Architecture Goal
AI Development Platform において、以下の既存レイヤーを接続するための Governance Event Bus Foundation を定義します。

* Knowledge Engine（Phase123）
* Governance Policy Engine（Phase124）
* Autonomous Review Runtime（Phase125）
* AIOS Resume Scope Control（Phase126）

本フェーズでは、イベント駆動アーキテクチャの「構造定義（Blueprint）」のみを実装し、実行・配信・キュー処理・永続化は一切行いません（空実装のみ）。

---

## 2. Design Principles
- **Blueprint Only**: 型、インターフェース、レジストリ、ディスパッチャのシグネチャ定義に限定。
- **No Execution Logic**: 物理的な配信やスレッド/プロセス間通信は実装しない。
- **No Queue / Broker / Messaging System**: Redis/Kafka/RabbitMQ 等のブローカー依存は一切排除。
- **Stateless Design**: Event Bus 自身は実行状態を保持しない。
- **Deterministic Event Contracts**: 定義されたイベントスキーマ以外のデータ流入を拒否する。
- **No Side Effects**: ファイルI/O、外部ネットワーク通信などは一切行わない。
- **Future Distributed Ready**: 将来の分散実行（Distributed Runtime）に対応可能なID体系・コンテキスト設計。

---

## 3. Specification Document [NEW]
- `docs/specifications/GovernanceEventBus.md`

---

## 4. TypeScript Blueprint
`src/eventbus/` ディレクトリ配下に以下の構造定義ファイルを作成します。

1. **`GovernanceEventType.ts`**
   - 列挙型: `KNOWLEDGE_EVENT`, `POLICY_EVENT`, `REVIEW_EVENT`, `SCOPE_EVENT`, `SYSTEM_EVENT`
2. **`GovernanceEventPriority.ts`**
   - 列挙型: `LOW`, `NORMAL`, `HIGH`, `CRITICAL`
3. **`GovernanceEvent.ts`**
   - インターフェース: `id`, `type`, `source`, `payload`, `timestamp`, `priority`
4. **`GovernanceEventContext.ts`**
   - インターフェース: `runtimeId`, `phase`, `module`, `correlationId`
5. **`GovernanceEventBusEngine.ts`**
   - インターフェース `IGovernanceEventBusEngine` (メソッド: `publish()`, `subscribe()`, `unsubscribe()`, `emit()`)
   - 抽象クラス `BaseGovernanceEventBusEngine` (空実装)
6. **`GovernanceEventRegistry.ts`**
   - クラス: `addListener()`, `removeListener()`, `getListeners()`, `listEvents()` のシグネチャと空実装。
7. **`GovernanceEventDispatcher.ts`**
   - クラス: `dispatch()`, `route()`, `resolveTarget()` のシグネチャと空実装。

---

## 5. Event Flow Model
```
Publisher ──> EventBus ──> Dispatcher ──> Subscribers
```

---

## 6. Integration Model (Event Sources)
- **Policy Engine**: `policy.change`
- **Review Runtime**: `review.completed`
- **Scope Control**: `scope.locked`
- **Knowledge Engine**: `knowledge.updated`

---

## 7. Scope of Impact

### Allowed (変更許可)
- `docs/specifications/GovernanceEventBus.md`
- `src/eventbus/*`
- `src/index.ts` (エクスポートの追加)

### Forbidden (変更禁止)
- Kafka / Redis / RabbitMQ 等のメッセージングミドルウェアの実装。
- データベース/永続化レイヤーへの接続。
- LLM / AIの実行ロジック。
- 非同期ジョブシステムや外部API連携。

---

## 8. Verification Plan (検証計画)
1. **ビルド検証**: `npx tsc --noEmit` または `npm run build`
2. **CIE 健全性検証**: `python3 tools/cie.py verify`
3. **境界の遵守**: `eventbus/` スコープ外のコード修正がないことの検証。

---

## 9. Definition of Done
* [ ] `docs/specifications/GovernanceEventBus.md` の作成
* [ ] `src/eventbus/*` の各種ファイル作成
* [ ] `src/index.ts` へのエクスポート追加と更新
* [ ] TypeScript ビルドが正常に PASS
* [ ] `python3 tools/cie.py verify` が正常に PASS
* [ ] `python3 tools/cie.py doctor` が正常に PASS
* [ ] `.venv/bin/pytest` が正常に PASS
* [ ] `HANDOVER.md` の更新
* [ ] ローカル Git コミットの作成（メッセージ: `CIE Phase 127: Governance Event Bus Foundation`）
