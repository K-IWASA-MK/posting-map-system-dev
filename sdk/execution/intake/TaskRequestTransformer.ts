/**
 * TaskRequestTransformer.ts
 * 
 * AIOS Task Request Transformer
 * 
 * 外部リクエスト（TaskIntakeRequest）を受け取り、AIOS内部の標準タスクモデル（ExecutionTask）へ安全に変換する。
 * 外部呼び出し元アプリケーションのトレーサビリティを保証するため、ExecutionTask.metadata 内に
 * `intake: { requestId, sourceApplication, receivedAt }` を全自動で注入保持する。
 */

import { ExecutionTask, ExecutionTaskFactory } from '../index';
import { TaskIntakeRequest } from './TaskIntakeRequestModel';

export class TaskRequestTransformer {
  /**
   * TaskIntakeRequest を ExecutionTask へ変換する
   */
  static transform(request: TaskIntakeRequest): ExecutionTask {
    const receivedAt = new Date().toISOString();

    const mergedMetadata: Record<string, any> = {
      ...(request.metadata || {}),
      intake: Object.freeze({
        requestId: request.requestId,
        sourceApplication: request.sourceApplication,
        receivedAt
      })
    };

    return ExecutionTaskFactory.createTask({
      title: request.title,
      description: request.description,
      priority: request.priority,
      requiredCapabilities: request.requiredCapabilities,
      metadata: mergedMetadata
    });
  }
}
