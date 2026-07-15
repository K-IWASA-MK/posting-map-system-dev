export type WorkspaceStatus = 'ACTIVE' | 'ARCHIVED';

export class Workspace {
  public readonly workspaceId: string;
  public readonly workspaceName: string;
  private status: WorkspaceStatus;
  private distributionGoal: number | null;
  private goalUpdatedAt: string | null;
  private goalUpdatedBy: string | null;

  constructor(params: {
    workspaceId: string;
    workspaceName: string;
    status: WorkspaceStatus;
    distributionGoal?: number | null;
    goalUpdatedAt?: string | null;
    goalUpdatedBy?: string | null;
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
    this.distributionGoal = params.distributionGoal !== undefined ? params.distributionGoal : null;
    this.goalUpdatedAt = params.goalUpdatedAt || null;
    this.goalUpdatedBy = params.goalUpdatedBy || null;
  }

  public getStatus(): WorkspaceStatus {
    return this.status;
  }

  public activate(): void {
    this.status = 'ACTIVE';
  }

  public archive(): void {
    this.status = 'ARCHIVED';
  }

  public getDistributionGoal(): number | null {
    return this.distributionGoal;
  }

  public getGoalUpdatedAt(): string | null {
    return this.goalUpdatedAt;
  }

  public getGoalUpdatedBy(): string | null {
    return this.goalUpdatedBy;
  }

  public updateGoal(goal: number, updatedBy: string): void {
    if (goal < 0) {
      throw new Error("Goal must be a positive number");
    }
    this.distributionGoal = goal;
    this.goalUpdatedAt = new Date().toISOString();
    this.goalUpdatedBy = updatedBy;
  }
}

