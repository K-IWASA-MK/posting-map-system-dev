# Dashboard Rendering Pipeline Specification (DashboardRenderingPipeline.md)

## 1. レンダリングフローと各層の責務
描画処理に関与する各オブジェクトの責務境界を規定し、不要な計算の混入を防ぐ。

1. **DashboardAPIClient**:
   - 責務: HTTP GET リクエストの発行、タイムアウト（5000ms）およびオフラインエラーの検知。データ自体の加工は一切行わない。
2. **DashboardDataAdapter**:
   - 責務: 取得した生データを、UIコンポーネントが処理しやすい論理構造（Normalized Object）へとスキーマ変換（マッピング）する。
3. **DashboardRenderer**:
   - 責務: 変更検知を仲介し、DOM 挿入位置の特定と HTML の部分置換を実行する。コンポーネントごとの HTML 文字列生成には静的な `Render` 関数を呼ぶのみ。
4. **DashboardRenderCache**:
   - 責務: 前回の描画時 Props 状態を保持し、新規 Props との不変性比較（Diff Detection）を行う。
5. **DashboardMotion**:
   - 責務: 描画が DOM 上で確定（リフロー）した後に、フェードインやイージング拡張などの視覚効果を起動する。

---

## 2. 描画タイミング (Rendering Triggers)
描画は以下のタイミングに制限する。
- **初回DOMContentLoadedイベント**: アプリ全体のロードが完了した最初の初期化時。
- **自動ポーリング間隔の到達**: Visibility が active で、データ更新の差分が検出された時。
- **EventBus経由の明示的シグナル**: 新着ログ受信通知等。

---

## 3. 不要な再描画の防止ルール (Diff Match Rules)

差分描画を円滑に行うため、以下の規則に従って DOM を制御する。

- **不変判定 (Immutability Check)**:
  `DashboardRenderCache` は、各コンポーネントの識別名（例: `KPICard-gov`, `StatusCard`）をキーとして、Props の JSON 表現をキャッシュする。
  ```javascript
  const isChanged = DashboardRenderCache.hasChanged(componentKey, newProps);
  ```
  値の変更がない（ハッシュが一致する）場合は、該当カードの `render` 関数呼び出しおよび `innerHTML` / `outerHTML` の書き換えを完全にスキップする。
- **部分置換の方法**:
  グリッドコンテナ内部の要素位置（DOM ID またはカードクラスの位置関係）を特定し、キャッシュ変更が検知されたコンポーネントの対応領域のみを置換する。他の未変更コンポーネントの DOM ノードやスクロール位置、ホバー状態は一切破壊しない。
