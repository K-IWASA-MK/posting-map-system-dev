export type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';

export class WorkspaceSubscription {
  public readonly workspaceId: string;
  private status: SubscriptionStatus;
  private readonly startedAt: Date;
  private readonly expiresAt: Date;

  constructor(params: {
    workspaceId: string;
    status: SubscriptionStatus;
    startedAt: Date;
    expiresAt: Date;
  }) {
    if (!params.workspaceId || params.workspaceId.trim().length === 0) {
      throw new Error("WorkspaceId is required for subscription");
    }
    this.workspaceId = params.workspaceId;
    this.status = params.status;
    this.startedAt = params.startedAt;
    this.expiresAt = params.expiresAt;
  }

  public getStatus(): SubscriptionStatus {
    return this.status;
  }

  public getStartedAt(): Date {
    return this.startedAt;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  public suspend(): void {
    this.status = 'SUSPENDED';
  }

  public cancel(): void {
    this.status = 'CANCELLED';
  }

  public reactivate(): void {
    this.status = 'ACTIVE';
  }
}
