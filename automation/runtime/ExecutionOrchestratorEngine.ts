import { ExecutionDefinition } from "./ExecutionDefinition";
import { ExecutionContext } from "./ExecutionContext";

export interface IExecutionOrchestratorEngine {
  register(definition: ExecutionDefinition): Promise<boolean>;
  execute(id: string, context: ExecutionContext): Promise<boolean>;
  pause(id: string): Promise<boolean>;
  resume(id: string): Promise<boolean>;
  cancel(id: string): Promise<boolean>;
  resolve(id: string): Promise<ExecutionDefinition | null>;
}

export abstract class BaseExecutionOrchestratorEngine implements IExecutionOrchestratorEngine {
  abstract register(definition: ExecutionDefinition): Promise<boolean>;
  abstract execute(id: string, context: ExecutionContext): Promise<boolean>;
  abstract pause(id: string): Promise<boolean>;
  abstract resume(id: string): Promise<boolean>;
  abstract cancel(id: string): Promise<boolean>;
  abstract resolve(id: string): Promise<ExecutionDefinition | null>;
}
