/**
 * AutonomousRuntimeBootstrap.ts
 * 
 * AIOS Autonomous Runtime Bootstrap
 * 
 * AIOS 起動時に EventBus / Listener / Callback Dispatcher を不変かつ多重登録なしで一括初期化し、
 * 自律実行ランタイムを READY 状態へ移行させるブートストラップエントリーポイント。
 */

import { AIEmployeeRegistry } from '../../employee/manager/registry/AIEmployeeRegistry';
import { TaskOrchestrationListener } from '../../execution/orchestration/TaskOrchestrationListener';
import { AutonomousCompletionCallbackDispatcher } from '../events/AutonomousCompletionCallbackDispatcher';
import { AutonomousRuntimeEventBus } from '../events/AutonomousRuntimeEventBus';

export enum AutonomousRuntimeState {
  UNINITIALIZED = 'UNINITIALIZED',
  READY = 'READY',
  SHUTDOWN = 'SHUTDOWN'
}

export class AutonomousRuntimeBootstrap {
  private static state: AutonomousRuntimeState = AutonomousRuntimeState.UNINITIALIZED;

  /**
   * 自律実行ランタイムを一括起動する（べき等性を保持し、多重登録を防止）
   */
  static start(registry?: AIEmployeeRegistry): AutonomousRuntimeState {
    if (registry) {
      TaskOrchestrationListener.configure(registry);
    }

    if (this.state === AutonomousRuntimeState.READY) {
      return this.state;
    }

    // 1. Configure AIEmployeeRegistry for Orchestration Listener
    const activeRegistry = registry || new AIEmployeeRegistry();
    TaskOrchestrationListener.configure(activeRegistry);

    // 2. Start Task Orchestration Listener (guaranteed single listener)
    TaskOrchestrationListener.startListening();

    // 3. Start Autonomous Completion Callback Dispatcher (guaranteed single listener)
    AutonomousCompletionCallbackDispatcher.startListening();

    this.state = AutonomousRuntimeState.READY;
    return this.state;
  }

  /**
   * 自律実行ランタイムを停止・リセットする
   */
  static stop(): void {
    TaskOrchestrationListener.stopListening();
    AutonomousCompletionCallbackDispatcher.stopListening();
    AutonomousRuntimeEventBus.clear();
    this.state = AutonomousRuntimeState.SHUTDOWN;
  }

  /**
   * 現在のランタイム状態を取得する
   */
  static getState(): AutonomousRuntimeState {
    return this.state;
  }

  /**
   * テスト用完全クリア
   */
  static clear(): void {
    this.stop();
    TaskOrchestrationListener.clear();
    AutonomousCompletionCallbackDispatcher.clear();
    this.state = AutonomousRuntimeState.UNINITIALIZED;
  }
}
