import { ExecutionLifecycleState } from "./ExecutionLifecycleState";
import { ExecutionLifecycleStage } from "./ExecutionLifecycleStage";

export interface ExecutionLifecycleResponse {
  readonly lifecycle: ExecutionLifecycleState;
  readonly stage: ExecutionLifecycleStage;
}
