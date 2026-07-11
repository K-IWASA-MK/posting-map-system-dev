# Google Maps Engine 仕様書 - Standard Edition (GoogleMapsEngine)

## 1. アーキテクチャ概要 (Architecture Overview)

本コンポーネントは、POSTING MAP Dashboard MVP に導入された `MapEngine` インターフェースを実装し、Standard Edition 用の Google Maps JavaScript API を制御するものです。

### 地図エンジン結合構造 (Dependency Flow)
```
Dashboard (MapPanel)
      │
      ▼
MapEngine (Interface)
      │
      ▼
GoogleMapsEngine
 ┌────┼───────────────────────────┐
 │    ▼                           ▼
 │  GoogleMapsScriptLoader     GoogleMapsConfiguration (Config Provider)
 │
 ├────▼───────────────────────────▼
 │  GoogleMapsLayerManager     GoogleMapsCameraController
 └────┬───────────────────────────┘
      ▼
   Google Maps API (window.google.maps)
```

---

## 2. インターフェース・マッピング (MapEngine Interface Mapping)

`GoogleMapsEngine` は [MapEngine.ts](file:///Volumes/SSD_DATA/posting-map-system/src/dashboard/map/MapEngine.ts) に定義された `MapEngine` インターフェースを完全に満たします。

| メソッド | 責務 | 内部実装委譲 |
| :--- | :--- | :--- |
| `initialize(container)` | APIの動的ロード、地図インスタンス化、各コントローラー初期化 | `GoogleMapsScriptLoader`, `GoogleMapsLayerManager` |
| `destroy()` | 地図オブジェクトの破棄、イベントリスナーの解除、メモリ解放 | 各コントローラーの `destroy()` |
| `showAreas(areas)` | 地区境界（Polygon / Circle）および進捗ピンの描画 | `GoogleMapsLayerManager` |
| `highlightArea(areaId)`| 選択された地区の強調（境界太さ変更、バウンス効果等） | `GoogleMapsLayerManager` |
| `moveCamera(lat, lng)` | 指定座標へスムーズに移動 | `GoogleMapsCameraController` |
| `addMarker(marker)` | 任意ピン（配布員活動地点など）の追加 | `GoogleMapsLayerManager` |
| `removeMarker(id)` | 指定ピンの削除 | `GoogleMapsLayerManager` |
| `updateLayer(id, opt)` | 特定レイヤーのプロパティ（表示/非表示、スタイル）の更新 | `GoogleMapsLayerManager` |

---

## 3. 設定プロバイダー (Configuration Provider)

APIキーおよび地図の初期パラメータは以下のフローを通じて `GoogleMapsEngine` へ供給されます。

```
Configuration Provider (GAS / Config File)
          ↓
window.POSTING_MAP_CONFIG (Runtime Setting SSOT)
          ↓
GoogleMapsConfiguration (Class)
          ↓
GoogleMapsEngine
```

* **APIキーの秘匿化**: `GoogleMapsConfiguration` 内に API キーをハードコーディングすることは禁止します。必ず `window.POSTING_MAP_CONFIG.GOOGLE_MAPS_API_KEY` を参照します。
* **デフォルト表示**: `DEFAULT_ZOOM`、`DEFAULT_CENTER`、`GESTURE_HANDLING`（モバイル対応として `cooperative` を推奨）を保持します。
* **Dark/Minimal スタイル**: UIデザイン規範（漆黒UI）に調和するため、道路・水面・緑地などの輝度を落としたカスタムスタイル JSON を地図初期化時に適用します。

---

## 4. スクリプト・ローダー (GoogleMapsScriptLoader)

Google Maps JavaScript API スクリプトを動的にインジェクションし、重複ロードを防ぐロードマネージャーです。

* **多重ロード防止**: `window.google` が既に存在するか、ロード開始フラグが立っている場合は、新規の `<script>` タグ生成をスキップして既存のロード完了 Promise を返却します。
* **Promise管理**: スクリプトタグの `onload` および `onerror` イベントを Promise の `resolve` / `reject` にブリッジし、ロードの成功・失敗を呼び出し元（`GoogleMapsEngine`）に通知します。

---

## 5. カメラ・ポリシー (GoogleMapsCameraController)

地図の画角および中心座標を安全かつ滑らかに制御します。

* **ズーム・パン移行**: `map.panTo()` および `map.setZoom()` を用い、急激な画面切り替え（ガクつき）を排除したイージング遷移を行います。
* **境界内フィット (Fit Bounds)**: 全ての地区ピンを同時に可視化する場合、ピンの座標範囲から `google.maps.LatLngBounds` を計算して `map.fitBounds(bounds)` を呼び出します。

---

## 6. レイヤー・マネージャー (GoogleMapsLayerManager)

地図上の描画アイテムを種類ごとに独立した「レイヤー」として管理し、個別更新・削除を可能にします。

1. **Area Layer (地区境界)**:
   - 各地区の境界ポリゴン（`google.maps.Polygon`）または中心点サークル（`google.maps.Circle`）を描画。
   - 進捗率に応じたヒートカラー（100%は緑、進行中は青、未着手は薄グレー）を適用。
   - 地区クリック時に `onAreaSelected` コールバックを呼び出し、クリックアニメーション効果を付与。
2. **VoteTurnout Layer (投票率ヒートレイヤー)**:
   - 過去選挙の投票率の高低を、円の半径や透過率（ヒートマップ形式）で可視化する。
3. **Activity Layer (配布実績ログ)**:
   - 直近のポスティング証跡イベント（EventLog）の位置に簡易発光ピン（またはマーカー）を表示する。
4. **Marker Layer (その他マーカー)**:
   - 配布員のリアルタイム位置などの動的マーカー。

---

## 7. セキュリティと運用ルール (Security & Operations)

本番運用を見据え、以下のセキュリティポリシーを適用します。

* **HTTPリファラー制限**: 本番環境で使用する API キーは、Google Cloud Console にて特定のドメイン（例: `*.github.io/*`）以外からのリクエストを拒否する設定を必須とします。
* **キーの分離**: 開発ローカル用と本番リリース用で異なる API キーを設定できるように、`config.js` を切り分ける構造とします。
* **Visualization Only Policy (再確認)**:
  - 地図はデータの可視化のみを行い、AIによる配分ルート、推奨配布順序、自動最適化などは一切含めてはなりません。
