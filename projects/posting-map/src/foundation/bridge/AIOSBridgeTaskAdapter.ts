import { BridgeMessage } from './BridgeMessage';
import { ProjectTaskRequest } from '../../../../../sdk/project/intake/types/ProjectTaskRequest';
import { ProjectTaskResponse } from '../../../../../sdk/project/intake/types/ProjectTaskResponse';
import { ProjectResult } from '../../../../../sdk/project/result/types/ProjectResult';
import { CapabilityResolver } from './CapabilityResolver';

export class AIOSBridgeTaskAdapter {
  public static toProjectTaskRequest(message: BridgeMessage): ProjectTaskRequest {
    const resolved = CapabilityResolver.resolve(message);
    const title = message.payload?.title || `[${message.messageType}] Business Event Task`;

    // Map messageType to valid FieldOperations task types
    let taskType = 'EXECUTE_FIELD_VERIFICATION';
    if (message.messageType === 'TERRITORY_INITIALIZATION' || message.payload?.taskType === 'TERRITORY_INITIALIZATION') {
      taskType = 'TERRITORY_INITIALIZATION';
    } else if (message.messageType === 'FIELD_REPORTS_AUDIT' || message.payload?.taskType === 'FIELD_REPORTS_AUDIT') {
      taskType = 'FIELD_REPORTS_AUDIT';
    } else if (message.payload?.taskType) {
      taskType = message.payload.taskType;
    }

    return {
      requestId: message.messageId,
      projectId: 'FIELD_OPERATIONS',
      taskType,
      payload: message.payload || {},
      parameters: {
        title,
        messageType: message.messageType,
        priority: resolved.priority,
        requiredCapabilities: resolved.capabilities,
        correlationId: message.correlationId,
        ...(message.payload || {})
      },
      timestamp: new Date(message.timestamp || Date.now()).toISOString()
    };
  }

  public static fromProjectResult(
    output: { response: ProjectTaskResponse; result?: ProjectResult },
    original: BridgeMessage
  ): BridgeMessage {
    const { response, result } = output;
    return new BridgeMessage({
      messageId: `rep-${original.messageId}`,
      messageType: `${original.messageType}.reply`,
      timestamp: Date.now(),
      source: 'AIOS',
      destination: original.source || 'POSTING_MAP',
      payload: {
        taskId: response.taskId,
        status: result ? result.status : response.status,
        completed: result ? result.completed : false,
        producedArtifacts: result ? result.producedArtifacts.map(a => a.location) : [],
        executionSummary: result ? result.executionSummary : response.rejectionReason || 'Task accepted by TaskIntakeGateway',
        details: 'Task successfully processed via AIOS ProjectBridgeRuntime & SupervisorRuntime'
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

