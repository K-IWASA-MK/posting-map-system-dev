/**
 * DashboardWorkspaceFactory.js
 * 
 * レジストリ仕様に基づいてワークスペースインスタンスを生成し、
 * 関連付けられているレイアウトおよびウィジェットの整合性バリデーションを実行するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

class DashboardWorkspaceFactory {
  /**
   * ワークスペース仕様からインスタンスをバリデーション検証した上で生成する
   * @param {object} spec レジストリに登録された仕様定義
   * @returns {object} Frozen Workspace Instance Object
   */
  static createWorkspace(spec) {
    if (!spec) {
      throw new Error('[DashboardWorkspaceFactory] Specification is required');
    }
    if (!spec.workspaceId) {
      throw new Error('[DashboardWorkspaceFactory] workspaceId is required');
    }

    const layoutRegistry = window.DashboardLayoutRegistry;
    const widgetRegistry = window.DashboardWidgetRegistry;

    // バリデーション: レイアウト仕様の存在整合性
    if (layoutRegistry && spec.layoutId && !layoutRegistry.getLayout(spec.layoutId)) {
      throw new Error(`[DashboardWorkspaceFactory] Referenced layoutId does not exist: ${spec.layoutId}`);
    }

    // バリデーション: ウィジェット仕様の存在整合性
    if (widgetRegistry && spec.widgetIds) {
      spec.widgetIds.forEach(widgetId => {
        if (!widgetRegistry.getWidget(widgetId)) {
          throw new Error(`[DashboardWorkspaceFactory] Referenced widgetId does not exist: ${widgetId}`);
        }
      });
    }

    const uniqueId = `winst-${spec.workspaceId}-${Math.floor(Math.random() * 1000000)}`;

    const workspaceInstance = {
      instanceId: uniqueId,
      workspaceId: spec.workspaceId,
      spec: spec, // フリーズ済みの仕様オブジェクトへの参照
      metadata: Object.freeze({
        createdAt: new Date().toISOString(),
        environment: 'LOCAL_SIMULATION'
      }),
      status: spec.status || 'active'
    };

    return Object.freeze(workspaceInstance);
  }
}

// グローバル公開
window.DashboardWorkspaceFactory = DashboardWorkspaceFactory;
