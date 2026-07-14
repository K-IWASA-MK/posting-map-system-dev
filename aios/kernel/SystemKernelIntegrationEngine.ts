import { SystemIntegrationContext, SystemKernelEvent } from "./SystemKernelEvent";

export interface ISystemKernelIntegrationEngine {
  initialize(): Promise<boolean>;
  syncGovernance(context: SystemIntegrationContext): Promise<boolean>;
  syncExecution(context: SystemIntegrationContext): Promise<boolean>;
  syncGraph(context: SystemIntegrationContext): Promise<boolean>;
  propagateEvent(event: SystemKernelEvent): Promise<boolean>;
  stabilize(): Promise<boolean>;
}

export abstract class BaseSystemKernelIntegrationEngine implements ISystemKernelIntegrationEngine {
  abstract initialize(): Promise<boolean>;
  abstract syncGovernance(context: SystemIntegrationContext): Promise<boolean>;
  abstract syncExecution(context: SystemIntegrationContext): Promise<boolean>;
  abstract syncGraph(context: SystemIntegrationContext): Promise<boolean>;
  abstract propagateEvent(event: SystemKernelEvent): Promise<boolean>;
  abstract stabilize(): Promise<boolean>;
}
