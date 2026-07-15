export enum ProjectLedgerEntryType {
  PROJECT_CREATED = 'PROJECT_CREATED',
  SPRINT_STARTED = 'SPRINT_STARTED',
  SPRINT_COMPLETED = 'SPRINT_COMPLETED',
  ISSUE_CREATED = 'ISSUE_CREATED',
  ISSUE_CLOSED = 'ISSUE_CLOSED',
  TASK_COMPLETED = 'TASK_COMPLETED'
}

export interface ProjectLedgerEntry {
  id: string;
  type: ProjectLedgerEntryType;
  projectId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class ProjectLedger {
  private entries: ProjectLedgerEntry[] = [];

  public append(type: ProjectLedgerEntryType, projectId: string, metadata?: Record<string, unknown>): void {
    this.entries.push({
      id: `pl-${Date.now()}`,
      type,
      projectId,
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  public getEntries(projectId: string): ProjectLedgerEntry[] {
    return this.entries.filter(e => e.projectId === projectId);
  }
}
