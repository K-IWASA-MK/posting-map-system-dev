# Product Release Candidate (RC) Specification (製品リリース候補版仕様書)

## 1. Product Release Architecture (製品リリースアーキテクチャ)
本リリース候補版（RC）は、Sprint 2 におけるコア同期、運用監視、現場活動可視化の全基盤を統合した製品出荷前検証用ビルドです。
本アーキテクチャは「安全・高精度・不変」のポスティング活動記録モデルを保護するため、厳格な起動時バリデーションおよび機能トグル制御を採用しています。

---

## 2. Boot Sequence (ブートシーケンス)
Dashboard 起動時の制御フローは以下の順番で厳格に統制されます：

```
[Window DOMContentLoaded]
         │
         ▼
[1. ProductConfiguration ロード] (window.POSTING_MAP_CONFIG オーバーライド適用)
         │
         ▼
[2. FeatureToggle 解決] (Edition Matrix に基づく機能制限設定の引き当て)
         │
         ▼
[3. ProductRuntimeValidator による検証]
         ├─ (検証失敗) ──► [showErrorOverlay 描画] (エラー表示・起動完全ブロック)
         └─ (検証成功) ──► [4. DashboardApplication 起動開始]
                                  │
                                  ├─► [5. Operational レイヤー初期化] (ヘルス監視・通知)
                                  ├─► [6. Synchronization レイヤー同期] (差分同期・キャッシュ)
                                  └─► [7. Field Operation レイヤー復元] (履歴ログ読み込み)
                                           │
                                           ▼
                                    [8. UI / Ready 状態]
```

---

## 3. Feature Toggle Architecture & Edition Matrix
すべての機能動作切り替えは `FeatureToggle` にて一元管理され、プログラムソースコード変更によるエディション切り替え（Edition Fork）を禁止します。

### Edition Matrix (エディション機能マトリクス)

| 機能 (Feature) | Standard | Premium | 説明 |
| :--- | :---: | :---: | :--- |
| **Google Maps** | ✅ | ✅ | 標準マップ表示およびヒートマップ、投票率可視化 |
| **Mapbox** | ❌ | ✅ | 将来の代替マップエンジン（Standardでは強制無効） |
| **Flyer Holding** | ✅ | ✅ | 手持ちチラシ残数および低在庫警告監視フロー |
| **GPS Evidence** | ✅ | ✅ | 配布員のリアルタイム位置、最終時間、アクティブ追跡 |
| **Photo Evidence** | ✅ | ✅ | 提出写真エビデンスの時系列・サムネイル一覧 |
| **Dashboard** | ✅ | ✅ | リフレッシュ監視、Force Refresh制御、システムヘルス表示 |
| **AIOS Bridge** | ❌ | ✅ | AIOS (AI組織) 連携用データブリッジ（Standard強制無効） |
| **Analytics** | ❌ | ✅ | AI分析、行動推計用アナリティクス（Standard強制無効） |

---

## 4. Configuration Policy (設定ポリシー)
* すべての設定パラメータは `window.POSTING_MAP_CONFIG` に構造化オブジェクトとしてバインドされる必要があります。
* 標準エディション (`Standard`) は初期起動時にデフォルトで引き当てられ、ライセンス（例: `MIE-03 LICENSE`）に紐付いて `Premium` に動的昇格が可能です。

---

## 5. Upgrade & Backward Compatibility Policy (アップグレード・互換性ポリシー)
* **API 後方互換性**: H-App からの `EventLog` 送信 JSON スキーマ、および GAS API レスポンススキーマは完全後方互換性を保証します。
* **クライアント・ステートマージ**: バージョン更新時、すでにインメモリまたはローカルストレージにキューイングされた送信待ち活動ログ（GPS・写真等）は破棄されず、再送リカバリーにより新 API 経由で正常にマージされます。

---

## 6. Release Candidate Checklist (リリース候補版チェックリスト)
本チェックリストの全項目を満たしている場合のみ、本番リリースが許可されます。

* **[ ] Build PASS**:
  - `npm run build` (`tsc --noEmit`) がエラーおよび警告なくクリーンにコンパイル完了していること。
* **[ ] All Tests PASS**:
  - 新設された `tests/test_product_release_candidate.ts` を含むすべてのユニットテストがパスしていること。
* **[ ] Regression PASS**:
  - 既存の同期、マップ、UI等の回帰テストスイートすべてが正常終了していること。
* **[ ] Architecture Review PASS**:
  - リモートプッシュ時の `Architecture Review` 品質ゲートに違反がないこと。
* **[ ] Feature Toggle Validation PASS**:
  - `FeatureToggle` クラスによる制限機能の強制無効化・エディション不整合チェックが機能していること。
* **[ ] Runtime Validation PASS**:
  - 環境（DOM, Window, APIパラメータ）の不足を検知し、適切に起動制御・ブロックが行えること。
* **[ ] Documentation Updated**:
  - 仕様書およびマイルストーン更新が完了していること。
* **[ ] PROJECT_SCOPE Updated**:
  - `PROJECT_SCOPE.md` が完了状態および次期目標（Sprint 3）付きで更新されていること。
* **[ ] HANDOVER Updated**:
  - `HANDOVER.md` が更新完了していること。
* **[ ] Git Commit**:
  - 変更内容がクリーンにコミットされていること。
* **[ ] Git Push**:
  - 開発ブランチ `origin-dev` へプッシュ完了していること。
* **[ ] Release Tag**:
  - `v4.51-sprint-2-completed` 等のリリース確定タグが打たれていること。
* **[ ] Sprint2 Audit PASS**:
  - プロダクト Sprint 2 品質監査（CIE Pro監査）に完全合格していること。
