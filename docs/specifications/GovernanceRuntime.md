# Governance Runtime 仕様書

## 概要
本仕様書は、AIOS におけるルールおよび統治ポリシーを管理・配布・監査する「Governance Runtime」の仕様を定義します。

## 構成と責務
Governance Runtime は、プラットフォーム全体のコンプライアンス管理における「ルールの定義と配布」に専念する制御プレーンです。
1. **ポリシー管理 (Policy Bundle)**:
   - 複数の `PolicyDefinition` をバージョン付きのグループ `PolicyBundle` として一括管理し、一貫性のある展開とロールバックを実現します。
2. **ポリシー有効化ライフサイクル**:
   - 各ポリシーのライフサイクル状態を定義します：
     - `DRAFT`: 起草中
     - `ACTIVE`: 有効化・監査対象
     - `DEPRECATED`: 非推奨（猶予期間）
     - `ARCHIVED`: アーカイブ（監査対象外）
3. **ポリシー配信 (Event Distribution)**:
   - `PolicyLoaded` および `PolicyActivated` イベントを発行し、EventBus 経由でプラットフォームへ配信します。
4. **不変チェックサム照合**:
   - 配布されるポリシーバンドルの一致性をチェックサム検証し、改ざんや破損から保護します。
