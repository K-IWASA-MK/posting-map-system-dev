/**
 * AutonomousCompletionCallbackDispatcher.ts
 * 
 * AIOS Autonomous Completion Callback Dispatcher
 * 
 * TASK_COMPLETED / TASK_FAILED / TASK_BLOCKED イベントを受信し、
 * 外部業務アプリケーション（External Apps 等）の Bridge 応答および Callback ディスパッチを処理する。
 */

import { AutonomousRuntimeEventBus } from './AutonomousRuntimeEventBus';
import { CompletionCallbackRegistry } from './CompletionCallbackRegistry';
import { RuntimeEvent, RuntimeEventType, TaskCompletionPayload } from './RuntimeEventModel';

export type ApplicationCallbackHandler = (event: RuntimeEvent<TaskCompletionPayload>) => Promise<void> | void;

export class AutonomousCompletionCallbackDispatcher {
  private static unsubscribeFuncs: Array<() => void> = [];
  private static isListening: boolean = false;
  private static dispatchedHistory: Array<RuntimeEvent<TaskCompletionPayload>> = [];

  /**
   * 外部業務アプリ用コールバックハンドラーを登録する（CompletionCallbackRegistryへ委譲）
   */
  static registerCallback(handler: ApplicationCallbackHandler): () => void {
    return CompletionCallbackRegistry.register(handler);
  }

  /**
   * EventBus へのリスナー登録を開始する
   */
  static startListening(): void {
    if (this.isListening) {
      return;
    }

    const handler = async (event: RuntimeEvent<TaskCompletionPayload>) => {
      // Event Isolation: Only process completion/failure/blocked events
      if (
        event.type !== RuntimeEventType.TASK_COMPLETED &&
        event.type !== RuntimeEventType.TASK_FAILED &&
        event.type !== RuntimeEventType.TASK_BLOCKED
      ) {
        return;
      }

      this.dispatchedHistory.push(event);

      // Delegate notification to CompletionCallbackRegistry
      await CompletionCallbackRegistry.notify(event);
    };

    const unsubCompleted = AutonomousRuntimeEventBus.subscribe(RuntimeEventType.TASK_COMPLETED, handler);
    const unsubFailed = AutonomousRuntimeEventBus.subscribe(RuntimeEventType.TASK_FAILED, handler);
    const unsubBlocked = AutonomousRuntimeEventBus.subscribe(RuntimeEventType.TASK_BLOCKED, handler);

    this.unsubscribeFuncs = [unsubCompleted, unsubFailed, unsubBlocked];
    this.isListening = true;
  }

  /**
   * リスナー解除およびクリアを行う
   */
  static stopListening(): void {
    for (const unsub of this.unsubscribeFuncs) {
      unsub();
    }
    this.unsubscribeFuncs = [];
    this.isListening = false;
  }

  /**
   * ディスパッチ済み履歴を取得する
   */
  static getDispatchedHistory(): readonly RuntimeEvent<TaskCompletionPayload>[] {
    return Object.freeze([...this.dispatchedHistory]);
  }

  /**
   * 状態をリセットする（テスト用）
   */
  static clear(): void {
    this.stopListening();
    CompletionCallbackRegistry.clear();
    this.dispatchedHistory = [];
  }
}

