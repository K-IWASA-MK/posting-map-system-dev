export enum DispatchMode {
  SYNCHRONOUS = 'SYNCHRONOUS',
}

export enum ExceptionPolicy {
  PROPAGATE = 'PROPAGATE',
}

export interface EventBusConfiguration {
  readonly dispatchMode: DispatchMode;
  readonly strictOrdering: boolean;
  readonly exceptionPolicy: ExceptionPolicy;
}
