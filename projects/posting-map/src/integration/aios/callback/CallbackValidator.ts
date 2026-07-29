/**
 * CallbackValidator.ts
 * Validates the structure and authenticity of the incoming callback.
 */
import { CallbackContext } from './CallbackContext';
import { CallbackAuthenticator } from './CallbackAuthenticator';
import { TaskResultPayload } from './TaskResultPayload';

export class CallbackValidator {
  constructor(private authenticator: CallbackAuthenticator) {}

  validate(context: CallbackContext, payload: any): { valid: boolean; reason?: string; taskResult?: TaskResultPayload } {
    // 1. Authentication
    if (!this.authenticator.authenticate(context, payload)) {
      return { valid: false, reason: 'Authentication failed' };
    }

    // 2. Structural Validation
    if (!payload || typeof payload !== 'object') {
      return { valid: false, reason: 'Invalid JSON payload' };
    }
    if (!payload.taskId) return { valid: false, reason: 'taskId is missing' };
    if (!payload.executionId) return { valid: false, reason: 'executionId is missing' };
    if (!payload.status) return { valid: false, reason: 'status is missing' };
    
    return { valid: true, taskResult: payload as TaskResultPayload };
  }
}
