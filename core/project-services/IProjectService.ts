/**
 * ProjectServiceState defines the lifecycle states of a project service.
 */
export enum ProjectServiceState {
  Created = 'Created',
  Initialized = 'Initialized',
  Running = 'Running',
  Stopped = 'Stopped'
}

/**
 * IProjectService is the universal interface for all platform services under AIOS.
 */
export interface IProjectService {
  readonly serviceId: string;
  readonly serviceName: string;
  readonly version: string;
  readonly state: ProjectServiceState;

  /**
   * Initializes the service. Transitions state: Created -> Initialized.
   */
  initialize(): Promise<void>;

  /**
   * Shuts down the service. Transitions state: Initialized -> Stopped.
   */
  shutdown(): Promise<void>;
}
