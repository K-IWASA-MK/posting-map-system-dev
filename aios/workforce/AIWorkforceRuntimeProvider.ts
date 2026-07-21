import { AIWorkforceRuntime } from './AIWorkforceRuntime';
import { AIWorkforceRequest } from './AIWorkforceRequest';
import { AIWorkforceResponse } from './AIWorkforceResponse';

export interface AIWorkforceRuntimeProvider {
  createRuntime(request: AIWorkforceRequest): AIWorkforceResponse;
  getRuntime(runtimeId: string): AIWorkforceResponse;
  listRuntimes(): readonly AIWorkforceRuntime[];
}
