import { IProjectService, ProjectServiceState } from './IProjectService';

/**
 * LauncherService is the skeleton service responsible for project boot preparation.
 * It strictly acts as a lifecycle frame and does not perform launch/execution in this foundation sprint.
 */
export class LauncherService implements IProjectService {
  public readonly serviceId = 'launcher-service';
  public readonly serviceName = 'Project Launcher Service';
  public readonly version = '1.0.0';
  
  private _state: ProjectServiceState = ProjectServiceState.Created;

  public get state(): ProjectServiceState {
    return this._state;
  }

  public async initialize(): Promise<void> {
    if (this._state !== ProjectServiceState.Created) {
      throw new Error(`Cannot initialize service in state: ${this._state}`);
    }
    // Simulation logic / pre-initialization logs can go here
    this._state = ProjectServiceState.Initialized;
  }

  public async shutdown(): Promise<void> {
    if (this._state !== ProjectServiceState.Initialized) {
      throw new Error(`Cannot shutdown service in state: ${this._state}`);
    }
    this._state = ProjectServiceState.Stopped;
  }
}
