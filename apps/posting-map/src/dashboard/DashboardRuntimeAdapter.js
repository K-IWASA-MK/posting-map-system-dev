/**
 * DashboardRuntimeAdapter.js
 * 
 * ランタイムマネージャーのコンテキストから、UI 表示に必要な
 * ブートシーケンス概要・初期化モジュールの不変 ViewModel を構築・提供するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・原因分析・推論・判断ロジックの実装は厳禁である。
 */

class DashboardRuntimeAdapter {
  /**
   * ランタイム状態表示用の ViewModel を取得する
   * @returns {object} Immutable Runtime View Model
   */
  static getDashboardRuntimeData() {
    const manager = window.DashboardRuntimeManager;
    const context = manager ? manager.getActiveContext() : null;

    if (!context) {
      return Object.freeze({
        runtimeId: '-',
        runtimeVersion: '-',
        runtimeStatus: 'unknown',
        initializedModulesCount: 0,
        initializedModules: Object.freeze([]),
        bootTimestamp: '-',
        bootDurationMs: 0
      });
    }

    const bootTime = new Date(context.bootTimestamp).getTime();
    const currentTime = new Date(context.runtimeTimestamp).getTime();
    const duration = currentTime - bootTime;

    return Object.freeze({
      runtimeId: context.runtimeId,
      runtimeVersion: context.runtimeVersion,
      runtimeStatus: context.runtimeStatus,
      initializedModulesCount: context.initializedModules.length,
      initializedModules: Object.freeze([...context.initializedModules]),
      bootTimestamp: context.bootTimestamp,
      bootDurationMs: duration >= 0 ? duration : 0
    });
  }
}

// グローバル公開
window.DashboardRuntimeAdapter = DashboardRuntimeAdapter;
