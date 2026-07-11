# POSTING MAP プロダクト開発範囲定義書 (PROJECT_SCOPE)

## 1. スプリント1 完了定義 (Sprint 1 Scope)
スプリント1では、ポスティング活動管理システム（POSTING MAP）の可視化ダッシュボードおよびAPI通信の強固な基盤を構築し、「製品としての体裁を備えたMVP」を完成させます。

### 完了条件と機能一覧
* **ダッシュボード起動フローの確立**:
  - 設定値に基づいて `DashboardApplication` が立ち上がり、DOMマウントから初期データ取得までがノンブロッキングで行われること。
* **GAS APIとの接続および実データマッピング**:
  - スプレッドシートの実データを取得し、スネークケースからキャメルケースへの構造化モデル（`AreaDetail`, `VoteTurnout`）へのマッピングを行うこと。
* **地図領域の可視化と Multi Map Engine 化**:
  - 地図部分への直接依存を排除した `MapEngine` 抽象化インターフェースを導入し、スプリント1用 `DOMMapEngine` が正常にエリアピンと進捗度合いを色で可視化すること。
* **過去3回国政選挙の投票率表示**:
  - エリア選択をトリガーに、対象エリアの直近3回の選挙投票率履歴（衆院選・参院選、全国平均比付きプログレスバー）が `VoteTurnoutVisualizer` で滑らかにアニメーション描画されること。
* **活動証跡イベントログ（EventLog）表示**:
  - 最新のポスティング実績ログがタイムスタンプ、配布数、担当メンバーID付きで詳細パネル内にリスト表示されること。
* **製品UI仕様 (Glass Morphism / Click = Animation)**:
  - 漆黒背景、ガラス透過ブラー（`blur(20px)`）、微発光ボーダー、ボタンやカードのクリック時のバウンス縮小スケールアニメーション（`scale(0.96)`）を適用し、製品としての高級感を確保すること。

---

## 2. スプリント2 ロードマップ (Sprint 2 Roadmap)
実業務運用に向けた実働OSへの昇華を目指す「Sprint 2: Real Operation Foundation」です。

### 完了した開発項目
* **Phase S2-1: Google Maps Engine Foundation** ✅
  - `MapEngine` 抽象化インターフェースを実装した `GoogleMapsEngine` を構築。
  - APIキーを `window.POSTING_MAP_CONFIG` から動的に引き当てる設定プロバイダー `GoogleMapsConfiguration` を実装。
  - 地図スクリプトの多重ロードを防ぐ Promise 制御の `GoogleMapsScriptLoader` を導入。
  - カメラ制御用の `GoogleMapsCameraController` および独立した4レイヤー（Area, VoteTurnout, Activity, Marker）を管理する `GoogleMapsLayerManager` に処理を委譲。
  - 地図パネル `MapPanel` との結合を行い、設定に基づき `DOMMapEngine` と自動切り替え可能な後方互換性を担保。

### 主な今後の開発項目
1. **LINE LIFF（Hアプリ）連携強化 (Phase S2-2 ~)**:
   - 配布員アプリ（Hアプリ）が現場でGPS打刻および配布進捗を報告した際、ダッシュボード側へほぼリアルタイムに反映するデータ同期パイプライン。
2. **Stripe自動契約・独占権管理の統合**:
   - Stripe決済情報をバインドし、支部別独占ライセンス（`TOKYO-01` 等）の自動停止・有効化。
3. **GAS API 本実装およびキャッシュ高速化**:
   - 大量データアクセス時の `CacheService` 適用と、SpreadsheetApp 読み込み最小化のGAS側本実装。
