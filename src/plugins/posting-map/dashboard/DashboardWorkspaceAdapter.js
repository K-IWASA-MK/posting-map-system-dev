/**
 * DashboardWorkspaceAdapter.js
 * 
 * ワークスペースレジストリからデータを抽出し、ファクトリによるインスタンスバリデーションを
 * 経由したうえで、描画層へ伝える不変 ViewModel を構築・提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・原因分析・推論・判断ロジックの実装は厳禁である。
 */

class DashboardWorkspaceAdapter {
  /**
   * ダッシュボードワークスペース管理用の ViewModel を取得する
   * @returns {object} Immutable Workspace View Model
   */
  static getDashboardWorkspaceData() {
    const registry = window.DashboardWorkspaceRegistry;
    if (!registry) {
      return Object.freeze({ workspaces: [] });
    }

    const rawSpecs = registry.getAllWorkspaces();

    // 各仕様定義からインスタンスを生成してバリデーションチェックをパスさせる
    const instances = rawSpecs.map(spec => {
      return window.DashboardWorkspaceFactory.createWorkspace(spec);
    });

    // 優先度 (priority) の昇順でソート
    const sorted = instances.sort((a, b) => a.spec.priority - b.spec.priority);

    return Object.freeze({
      workspaces: Object.freeze(sorted.map(w => Object.freeze(w)))
    });
  }
}

// グローバル公開
window.DashboardWorkspaceAdapter = DashboardWorkspaceAdapter;
