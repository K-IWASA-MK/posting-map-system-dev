export type WorkspaceStatus = 'ACTIVE' | 'INACTIVE';

export class Workspace {
  public readonly workspaceId: string;
  public readonly workspaceName: string;
  private status: WorkspaceStatus;

  constructor(params: {
    workspaceId: string;
    workspaceName: string;
    status: WorkspaceStatus;
  }) {
    if (!params.workspaceId || params.workspaceId.trim().length === 0) {
      throw new Error("WorkspaceId is required");
    }
    if (!params.workspaceName || params.workspaceName.trim().length === 0) {
      throw new Error("WorkspaceName is required");
    }
    this.workspaceId = params.workspaceId;
    this.workspaceName = params.workspaceName;
    this.status = params.status;
  }

  public getStatus(): WorkspaceStatus {
    return this.status;
  }

  public activate(): void {
    this.status = 'ACTIVE';
  }

  public deactivate(): void {
    this.status = 'INACTIVE';
  }
}
