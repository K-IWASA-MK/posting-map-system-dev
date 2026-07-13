# Dashboard Memory Management Specification (DashboardMemoryManagement.md)

## 1. EventListener の管理と購読解除 (Listener Lifecycle)
長時間稼働に伴うクロージャの蓄積を回避するため、イベントリスナーの登録と解放は対で管理する。
- **EventBus の多重サブスクライブ防止**:
  同じリスナー（同一イベント名・同一コールバック）が多重登録されないよう、登録時に一意チェックを行う。
- **明示的なクリーンアップ関数の提供**:
  コンポーネントが動的に差し引かれたり再生成される際は、関連リスナーを `unsubscribe(event, callback)` で明示的に解除する。また、ページ破棄やリセット用に `clearListeners()` API を確保する。

---

## 2. Polling & Timer の VisibilityState 連動
ブラウザの非表示状態（`document.visibilityState === 'hidden'`）において、CPU リソースおよび無駄な API 通信を発生させない。

- **一時停止 (Pause)**:
  `visibilitychange` イベントをハンドリングし、状態が `hidden` に遷移した際、`DashboardPollingController` のタイマー（`setInterval` / `setTimeout`）をクリア（`clearInterval`）し、動作状態を `PAUSED` にする。アニメーションも同様に停止する。
- **再開 (Resume) と二重実行防止**:
  状態が `visible` に復帰した際、ポーリングタイマーを即座に再起動する。この際、**既存の未完了の fetch リクエストがある場合は二重リクエストを防止するロックフラグを評価し、重複した要求を遮断する。**

---

## 3. DOM 参照の適切な解放
JavaScript 変数内に不要な DOM ノード（Detached DOM Tree）のキャッシュ参照を残し続けないための規則。
- **変数参照の null 化**:
  `DashboardRenderer` 内などで取得した特定のカードノードや SVG コンテナは、グローバル変数や静的クラスの変数に永続保持せず、必要時のみ `document.getElementById` や `querySelector` で動的探索するか、参照破棄時に `null` で上書きする。
- **循環参照の排除**:
  DOM ノードのプロパティにイベントハンドラやコンポーネントインスタンスを直接代入して循環参照を生成してはならない。
