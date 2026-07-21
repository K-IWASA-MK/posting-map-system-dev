import { AIWorkforceExecution } from './AIWorkforceExecution';
import { AIWorkforceExecutionRequest } from './AIWorkforceExecutionRequest';
import { AIWorkforceExecutionResponse } from './AIWorkforceExecutionResponse';

export interface AIWorkforceExecutionProvider {
  createExecution(request: AIWorkforceExecutionRequest): AIWorkforceExecutionResponse;
  getExecution(executionId: string): AIWorkforceExecutionResponse;
  listExecutions(): readonly AIWorkforceExecution[];
}
