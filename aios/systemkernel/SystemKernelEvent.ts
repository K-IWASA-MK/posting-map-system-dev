export interface SystemKernelEvent {
  eventId: string;
  sourceLayer: string;
  targetLayer: string;
  payload: Record<string, any>;
  correlationId: string;
  priority: string;
}

export interface SystemKernelState {
  globalStateId: string;
  kernelState: string;
  metaState: string;
  executionState: string;
  graphState: string;
  auditState: string;
}

export interface SystemIntegrationContext {
  runtimeId: string;
  activeKernelRef: string;
  activeGraphSnapshot: string;
  governanceSnapshot: string;
  eventBusSnapshot: string;
}
