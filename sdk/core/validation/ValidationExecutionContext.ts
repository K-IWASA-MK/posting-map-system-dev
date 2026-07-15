import { DevelopmentContext } from '../context/DevelopmentContext';
import { ExecutionSession } from '../engine/ExecutionSession';

export interface ValidationExecutionContext {
  readonly context: DevelopmentContext;
  readonly session: ExecutionSession;
  readonly pipelineId: string;
  readonly executionMode: string;
}
