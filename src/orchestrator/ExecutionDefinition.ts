import { ExecutionType } from "./ExecutionType";
import { ExecutionStatus } from "./ExecutionStatus";
import { ExecutionMetadata } from "./ExecutionMetadata";
import { ExecutionContext } from "./ExecutionContext";

export interface ExecutionDefinition {
  id: string;
  name: string;
  type: ExecutionType;
  status: ExecutionStatus;
  metadata: ExecutionMetadata;
  context?: ExecutionContext;
}
