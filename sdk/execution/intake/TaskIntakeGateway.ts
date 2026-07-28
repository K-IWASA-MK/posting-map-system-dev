/**
 * TaskIntakeGateway.ts
 * 
 * AIOS Task Intake Gateway
 * 
 * 外部業務アプリケーションから送信されたTaskIntakeRequestを受領し、
 * バリデーション ➔ 変換 ➔ ExecutionTaskRegistryへの受託登録 ➔ 監査ログ記録 を全自動実行するエントリーポイント。
 */

import { ExecutionTask, ExecutionTaskRegistry } from '../index';
import { TaskIntakeAuditManager } from './TaskIntakeAudit';
import { TaskIntakeRequest } from './TaskIntakeRequestModel';
import { TaskIntakeRequestValidator } from './TaskIntakeRequestValidator';
import { TaskRequestTransformer } from './TaskRequestTransformer';

export class TaskIntakeGateway {
  /**
   * 外部業務アプリからのTask要求を受託登録する
   */
  static submitTask(request: TaskIntakeRequest): ExecutionTask {
    const receivedAt = new Date().toISOString();

    // 1. Validation
    const valResult = TaskIntakeRequestValidator.validateRequest(request);
    if (!valResult.valid) {
      TaskIntakeAuditManager.recordIntake({
        requestId: request?.requestId || 'UNKNOWN',
        sourceApplication: request?.sourceApplication || 'UNKNOWN',
        receivedAt,
        status: 'REJECTED',
        error: valResult.reason
      });
      throw new Error(`[TaskIntakeGateway] Request rejected: ${valResult.reason}`);
    }

    // 2. Transformation
    const task = TaskRequestTransformer.transform(request);

    // 3. Register to ExecutionTaskRegistry
    ExecutionTaskRegistry.register(task);

    // 4. Record Audit Log
    TaskIntakeAuditManager.recordIntake({
      requestId: request.requestId,
      taskId: task.taskId,
      sourceApplication: request.sourceApplication,
      receivedAt,
      status: 'ACCEPTED'
    });

    return task;
  }
}
