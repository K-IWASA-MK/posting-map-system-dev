import { BridgeMessage } from './BridgeMessage';
import { TaskIntakeRequest } from '../../../../../sdk/execution/intake/TaskIntakeRequestModel';
import { ExecutionTask } from '../../../../../sdk/execution/ExecutionTaskModel';
import { CapabilityResolver } from './CapabilityResolver';

export class AIOSBridgeTaskAdapter {
  public static toTaskIntakeRequest(message: BridgeMessage): TaskIntakeRequest {
    const resolved = CapabilityResolver.resolve(message);
    const title = message.payload?.title || `[${message.messageType}] Business Event Task`;
    const description = message.payload?.description || JSON.stringify(message.payload || {});

    const metaPayload = message.payload?.metadata || {};

    return {
      requestId: message.messageId,
      sourceApplication: message.source || 'POSTING_MAP',
      title,
      description,
      priority: resolved.priority,
      requiredCapabilities: resolved.capabilities,
      metadata: {
        messageType: message.messageType,
        correlationId: message.correlationId,
        ...metaPayload,
        payload: message.payload
      },
      requestedAt: new Date(message.timestamp || Date.now()).toISOString()
    };
  }

  public static fromExecutionTask(task: ExecutionTask, original: BridgeMessage): BridgeMessage {
    return new BridgeMessage({
      messageId: `rep-${original.messageId}`,
      messageType: `${original.messageType}.reply`,
      timestamp: Date.now(),
      source: 'AIOS',
      destination: original.source || 'POSTING_MAP',
      payload: {
        taskId: task.taskId,
        status: task.status,
        assignedEmployeeId: task.assignedEmployeeId,
        title: task.title,
        priority: task.priority,
        details: 'Task successfully accepted by AIOS TaskIntakeGateway'
      },
      protocolVersion: original.protocolVersion,
      correlationId: original.correlationId
    });
  }

  public static fromMockResult(
    mockResult: { echo: Record<string, any>; status: string; details: string },
    original: BridgeMessage
  ): BridgeMessage {
    return new BridgeMessage({
      messageId: `rep-${original.messageId}`,
      messageType: `${original.messageType}.reply`,
      timestamp: Date.now(),
      source: 'AIOS',
      destination: original.source || 'POSTING_MAP',
      payload: mockResult,
      protocolVersion: original.protocolVersion,
      correlationId: original.correlationId
    });
  }
}
