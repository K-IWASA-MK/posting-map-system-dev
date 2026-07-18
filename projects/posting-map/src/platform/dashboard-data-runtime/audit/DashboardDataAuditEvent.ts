export interface DashboardDataAuditEvent {
  readonly eventType: "DASHBOARD_DATA_GENERATED";
  readonly executionId: string;
  readonly schemaVersion: string; // Audit Event Schema Version
  readonly runtime: {
    readonly name: "DashboardDataRuntime";
    readonly version: string;
  };
  readonly sourceHash: string;
  readonly output: {
    readonly file: string;
    readonly schemaVersion: string; // Output data schema version
  };
  readonly timestamp: string;
  readonly lineage: {
    readonly sources: readonly string[];
    readonly sourceHash: string;
    readonly outputHash: string;
  };
}
