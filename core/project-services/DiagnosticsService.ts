import { IProjectService, ProjectServiceState } from './IProjectService';

/**
 * DiagnosticsService is the skeleton service responsible for project structure diagnostic checks.
 * In this foundation sprint, it does not scan files or run diagnostic logic.
 */
export class DiagnosticsService implements IProjectService {
  public readonly serviceId = 'diagnostics-service';
  public readonly serviceName = 'Project Diagnostics Service';
  public readonly version = '1.0.0';

  private _state: ProjectServiceState = ProjectServiceState.Created;

  public get state(): ProjectServiceState {
    return this._state;
  }

  public async initialize(): Promise<void> {
    if (this._state !== ProjectServiceState.Created) {
      throw new Error(`Cannot initialize service in state: ${this._state}`);
    }
    this._state = ProjectServiceState.Initialized;
  }

  public async shutdown(): Promise<void> {
    if (this._state !== ProjectServiceState.Initialized) {
      throw new Error(`Cannot shutdown service in state: ${this._state}`);
    }
    this._state = ProjectServiceState.Stopped;
  }

  /**
   * Diagnostic interface skeleton.
   * Throws a Not Implemented error to preserve separation of concerns in G6-10.
   */
  public diagnose(projectId: string): any {
    throw new Error(`Diagnostics for project '${projectId}' is not implemented in this foundation sprint.`);
  }
}
