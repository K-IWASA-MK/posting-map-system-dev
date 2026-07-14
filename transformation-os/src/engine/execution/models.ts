import { Command, OSEvent } from '../../models/protocol';
import { PluginContext } from '../plugin/loader/models';

export interface ExecutionRequest {
  readonly requestId: string;
  readonly executionId: string;
  readonly createdAt: string;
  readonly deadline: string;
  readonly command: Command;
}

export interface ExecutionPlan {
  readonly pluginId: string;
  readonly priority: number;
  readonly retryPolicy: number;
  readonly timeout: number;
  readonly executionPolicy: string;
}

export interface ExecutionToken {
  readonly tokenId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly runtimeId: string;
}

export interface ExecutionSession {
  readonly sessionId: string;
  readonly executionToken: ExecutionToken;
  readonly pluginContext: PluginContext;
  readonly startTime: string;
}

export interface ExecutionResult {
  readonly success: boolean;
  readonly events?: readonly OSEvent[];
  readonly error?: string;
}
