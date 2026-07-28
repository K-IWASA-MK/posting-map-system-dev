/**
 * AIOSRuntimeInitializer.ts
 * 
 * POSTING MAP AIOS Runtime Initializer
 * 
 * POSTING MAP アプリケーション層専用の AIOS Runtime 起動イニシャライザ。
 * 通信プロバイダ（LiveAIOSClient 等）とライフサイクル初期化の責務を分離し、
 * アプリ起動時に AutonomousRuntimeBootstrap のセットアップおよび CompletionCallbackRegistry への
 * POSTING MAP 用コールバック登録を一括実行する。
 */

import {
  AutonomousRuntimeBootstrap,
  AutonomousRuntimeState,
  BootstrapManager,
  CompletionCallbackRegistry,
  RuntimeEvent,
  TaskCompletionPayload
} from '../../../../../sdk/runtime';

export class AIOSRuntimeInitializer {
  private static initialized: boolean = false;
  private static receivedCallbackLogs: Array<RuntimeEvent<TaskCompletionPayload>> = [];
  private static unsubscribeCallback: (() => void) | null = null;

  /**
   * POSTING MAP 用 AIOS 自律ランタイムを初期化・ブートストラップする
   */
  static initialize(): AutonomousRuntimeState {
    if (this.initialized) {
      return AutonomousRuntimeBootstrap.getState();
    }

    // 1. Bootstrap AIOS Organization & Autonomous Runtime
    const state = BootstrapManager.initialize();

    // 2. Register POSTING MAP Application Completion Callback to CompletionCallbackRegistry
    this.unsubscribeCallback = CompletionCallbackRegistry.register((event) => {
      this.receivedCallbackLogs.push(event);
      console.log(`[POSTING MAP AIOS Callback] Received event ${event.type} for task: ${event.payload.taskId}`);
    });

    this.initialized = true;
    return state;
  }

  /**
   * 初期化済みか否かを返す
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 受信したコールバックイベントログ一覧を取得する
   */
  static getReceivedCallbackLogs(): readonly RuntimeEvent<TaskCompletionPayload>[] {
    return Object.freeze([...this.receivedCallbackLogs]);
  }

  /**
   * リセットを行う（テスト・初期化用）
   */
  static reset(): void {
    if (this.unsubscribeCallback) {
      this.unsubscribeCallback();
      this.unsubscribeCallback = null;
    }
    this.receivedCallbackLogs = [];
    this.initialized = false;
  }
}
