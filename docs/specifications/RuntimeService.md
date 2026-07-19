# Runtime Service 仕様書

## 概要
本仕様書は、AIOS における各実行環境（Runtime）間の疎結合な連携、ライフサイクル、および動的な登録と解決を実現する「Runtime Service Layer」の仕様を定義します。

## 責務
Runtime Service Layer は、各 Runtime 間の直接的な結合を排除し、プラットフォームの中核として以下の責務を担います。

1. **Runtime 登録（Registration）**: `register(runtime, type)` を介した動的な Runtime 登録。
2. **Runtime 解決（Resolution）**: ID に基づく他の Runtime の動的参照解決。
3. **Runtime 状態管理（Lifecycle Management）**: ライフサイクルの各遷移（Registering, Initializing, Running, Stopping, Stopped）の制御と記録。
4. **アクティベーション・非アクティベーション（Activation/Deactivation）**: 各 Runtime の必要に応じた動的なブート、終了の順序統制。
5. **ヘルス監視（Health Monitoring）**: 登録された各 Runtime の健全性（status, reason, lastCheckedAt）の定期監査。

## 標準登録ランタイム (Standard Registered Runtimes)
本プラットフォームにおける自己規制（Self-Regulation）閉ループの運用を目的とし、以下のランタイムが Runtime Service Layer に標準登録され、ディスカバリ検索およびライフサイクル管理の統治下に置かれます。
- **Governance Runtime (`aios.governance`)**: プラットフォーム全体のポリシーバンドルの配布・バージョン管理。
- **Quality Runtime (`aios.quality`)**: プラットフォーム品質スコア監査、ポリシー判定。
- **Automation Runtime (`aios.automation`)**: 自動修復アクション承認、実行キューイング制御。


---

## 拡張設計ポイント (Future Extension points)

### 1. Runtime Factory (Marketplace 拡張)
将来の Plugin Marketplace および動的なサードパーティ Runtime 追加に備え、`RuntimeFactory` 抽象を統合可能です。
- **インターフェース案**:
  ```typescript
  export interface IRuntimeFactory {
    createRuntime(manifest: RuntimeManifest): Promise<IRuntime>;
  }
  ```
- **効果**: `RuntimeService.register` 時にマニフェストを受け取り、適合する `RuntimeFactory` に作成を委譲することで、コンパイル時に存在しない Runtime の動的ブートが可能になります。
