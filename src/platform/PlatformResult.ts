import { ApiResponse } from '../api/ApiResponse';
import { PlatformStage } from './PlatformStage';
import { PlatformExecutionContext } from './PlatformExecutionContext';

export interface PlatformResult {
  readonly success: boolean;
  readonly response?: ApiResponse;
  readonly failedStage?: PlatformStage;
  readonly error?: Error;
  readonly executionContext: PlatformExecutionContext;
}
