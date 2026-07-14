# PoC-001: 配布員ステータスカード
## Value Contract

- **Value Metrics**: 管理者が1人の配布員の稼働状況を視認・判断するまでの所要時間
- **Value Evidence**: 管理画面でのUI描画完了時間および視線移動・認知テスト（Lighthouse LCP & 認知負荷計測）
- **Value Threshold**: 状況確認時間を「現状の10秒」から「3秒以内」へ短縮する
- **Value Validation**: カードコンポーネントが単一の視認領域（Viewport）に収まり、色やアイコンで3秒以内に状態を判別可能であること（過度なレスポンス遅延やスクロールが不要であること）
