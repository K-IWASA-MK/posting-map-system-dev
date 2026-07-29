/**
 * AIOSCallbackReceiver.ts
 * Main entrypoint for receiving AIOS Callbacks.
 */
import { CallbackContext } from './CallbackContext';
import { CallbackResponse } from './CallbackResponse';
import { CallbackValidator } from './CallbackValidator';
import { TaskResultHandler } from '../../../application/callback/TaskResultHandler';
import { CallbackEventTypes, CallbackEvent } from './CallbackEvent';

export interface ICallbackEventPublisher {
  publish(event: CallbackEvent): void;
}

export class AIOSCallbackReceiver {
  constructor(
    private validator: CallbackValidator,
    private handler: TaskResultHandler,
    private eventPublisher: ICallbackEventPublisher
  ) {}

  async receive(context: CallbackContext, payload: any): Promise<CallbackResponse> {
    // 1. Audit: Received
    this.eventPublisher.publish(Object.freeze({
      type: CallbackEventTypes.TASK_RESULT_RECEIVED,
      timestamp: new Date(),
      requestId: context.requestId
    }));

    // 2. Validate & Authenticate
    const validation = this.validator.validate(context, payload);
    
    if (!validation.valid || !validation.taskResult) {
      this.eventPublisher.publish(Object.freeze({
        type: CallbackEventTypes.TASK_RESULT_REJECTED,
        timestamp: new Date(),
        requestId: context.requestId,
        reason: validation.reason
      }));

      return Object.freeze({
        statusCode: 401, // Auth or validation failure
        accepted: false,
        receivedAt: new Date(),
        requestId: context.requestId,
        message: `Rejected: ${validation.reason}`
      });
    }

    // 3. Audit: Validated
    this.eventPublisher.publish(Object.freeze({
      type: CallbackEventTypes.TASK_RESULT_VALIDATED,
      timestamp: new Date(),
      requestId: context.requestId,
      taskId: validation.taskResult.taskId,
      executionId: validation.taskResult.executionId
    }));

    // 4. Delegate to Handler
    try {
      await this.handler.handle(validation.taskResult);
    } catch (error: any) {
      return Object.freeze({
        statusCode: 500,
        accepted: false,
        receivedAt: new Date(),
        requestId: context.requestId,
        message: `Internal Handler Error: ${error.message}`
      });
    }

    // 5. Audit: Accepted
    this.eventPublisher.publish(Object.freeze({
      type: CallbackEventTypes.TASK_RESULT_ACCEPTED,
      timestamp: new Date(),
      requestId: context.requestId,
      taskId: validation.taskResult.taskId,
      executionId: validation.taskResult.executionId
    }));

    // 6. Return ACK
    return Object.freeze({
      statusCode: 200,
      accepted: true,
      receivedAt: new Date(),
      requestId: context.requestId,
      message: 'Callback accepted and processed successfully'
    });
  }
}
