export enum DeploymentLedgerEntryType {
  BUILD_LOG = 'BUILD_LOG',
  TEST_REPORT = 'TEST_REPORT',
  DEPLOYMENT_AUDIT = 'DEPLOYMENT_AUDIT',
  ROLLBACK_AUDIT = 'ROLLBACK_AUDIT'
}

export interface DeploymentLedgerEntry {
  id: string;
  type: DeploymentLedgerEntryType;
  jobId: string;
  projectId: string;
  timestamp: string;
  provider: string;
  artifactUrl?: string;
  environment?: string;
  digest?: string;
  durationMs?: number;
  rollbackReason?: string;
  metadata?: Record<string, unknown>;
}

export class DeploymentLedger {
  private entries: DeploymentLedgerEntry[] = [];

  public append(entry: Omit<DeploymentLedgerEntry, 'id' | 'timestamp'>): void {
    this.entries.push({
      ...entry,
      id: `dl-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }

  public getEntriesByJob(jobId: string): DeploymentLedgerEntry[] {
    return this.entries.filter(e => e.jobId === jobId);
  }
}
