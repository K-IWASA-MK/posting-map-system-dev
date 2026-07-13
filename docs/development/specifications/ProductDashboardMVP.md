# 製品版 POSTING MAP Dashboard MVP 仕様書

## 1. 概要 (Overview)
本仕様書は、POSTING MAP プロダクトのスプリント1で構築した基盤コンポーネント群を統合し、実運用に耐えうる製品版 **POSTING MAP Dashboard MVP** を構築するための最終統合仕様を規定します。

---

## 2. 統合アーキテクチャ (Integration Architecture)

ダッシュボードは、以下のデータフローおよび制御構造に従って起動・運用されます。

```
[ スプレッドシート DB ]
         ▲
         │ (GAS API 経由)
         ▼
[ DashboardApiClient ]
         │ (snake_case -> camelCase 変換)
         ▼
[ DashboardStateModel ]
         │ (自動状態変更通知: subscribe)
         ▼
[ DashboardLayout ] <--- [ DashboardEventCoordinator ] (仲介)
                        ├── MapPanel (MapEngine アダプター)
                        └── AreaDetailPanel
```

---

## 3. 起動フロー (Startup Flow)

ダッシュボードの表示開始時、以下のライフサイクルに従って決定論的かつ段階的に起動が行われます。

1. **初期ロード開始 (`BOOTSTRAP`)**:
   - `DOMContentLoaded` イベントを契機に、`DashboardBootstrap` が設定値（`CONFIG.API_BASE`等）を読み込み、`DashboardApplication.getInstance().start()` をコールします。
2. **ローディング表示の開始**:
   - `isLoading` が `true` に遷移し、UIが微光するスケルトンローダー（またはブラー透過レイヤー）でカバーされ、一瞬の白画面やUIのガクつきを防ぎます。
3. **API接続およびState構築**:
   - `DashboardApiClient` が `getDashboard` アクションをPOST送信し、成功データを受け取ると `DashboardStateModel` がデータをパース・不変化（`Object.freeze`）して状態を格納します。
4. **初期描画 (`RENDER`)**:
   - `DashboardLayout` が `subscribe` を通じて状態変化を検知し、ヘッダー同期ステータス、全体進捗サマリーカード、地図パネルを描画します。
5. **待機・監視状態 (`READY`)**:
   - 初期ロードを完了してローディング表示を非表示にし、定期ポーリング更新（1分周期）およびユーザーイベントの監視状態に入ります。

---

## 4. Multi Map Engine Architecture (複数地図エンジン抽象化仕様)

将来の地図エンジン変更（Google Maps ↔ Mapbox 等）に対応するため、ダッシュボード本体は地図のAPIを直接コールせず、以下の `MapEngine` インターフェースを通じて操作します。

```typescript
export interface MapEngine {
  initialize(container: HTMLDivElement): void;
  destroy(): void;
  showAreas(areas: readonly AreaDetail[]): void;
  highlightArea(areaId: string): void;
  moveCamera(latitude: number, longitude: number): void;
  addMarker(marker: any): void;
  removeMarker(markerId: string): void;
  updateLayer(layerId: string, options: any): void;
}
```

### スプリント1での位置づけ
- **DOMMapEngine**:
  - スプリント1では、余計な外部ネットワーク依存を排除し、高速かつ軽量なDOMベースのピン（微発光カラーマッピング付き）を用いてエリアの進捗状態を可視化します。
- **スプリント2への布石**:
  - スプリント2では、このインターフェースの実装として `GoogleMapsEngine` および `MapboxEngine` を追加することで、ダッシュボード側のコードを一行も変えることなく本物の地図エンジンへ差し替えることができます。

---

## 5. データ更新ポリシー (Data Refresh Policy)

- **手動更新 (Manual Refresh)**:
  - ユーザーが更新ボタンをタップすると、直ちに `DashboardRefreshController` が起動し、`loadDashboard(..., force=true)` を実行します。
- **自動更新 (Auto Polling)**:
  - バックグラウンドで1分間隔（60000ms）で API を呼び出し、最新の進捗や活動証跡を取得・反映します。
- **更新ガード (10秒制限)**:
  - 手動更新または頻繁な画面状態変更の際、前回のAPI取得完了時刻から「10秒未満」のリクエストは、APIへの高負荷を抑止するため、通信を行わずキャッシュデータをそのまま返却してガードします。

---

## 6. エラーハンドリングおよびローディングポリシー

- **途中状態を見せない制御**:
  - API通信中（`isLoading === true`）は、全体表示の透明度を `opacity: 0.6` に落とし、微発光スケルトンを表示してガクつきを抑えます。
- **ネットワーク切断/APIエラー時**:
  - エラーオブジェクト（`error`）がセットされ、UIはエラーの発生を検知してヘッダーに赤色の「● ERROR」バッジを表示するとともに、エラーカードを透過ポップアップさせて、ユーザーにネットワーク再接続を促す日本語メッセージを表示します。
