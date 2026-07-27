export interface ReleaseRequest {
  readonly releaseId: string;
  readonly sprintId: string;
  readonly version: string;
  readonly targetEnvironment: "production" | "staging" | "development" | string;
  readonly artifacts: {
    readonly filePath: string;
    readonly expectedHash?: string;
  }[];
  readonly schemaVersion: "v1";
  readonly targetRepository?: string;
  readonly targetBranch?: string;
  readonly targetPublishRoot?: string;
  readonly frontendConfigPath?: string;
  readonly expectedBackendEndpoint?: string;
  readonly expectedBackendVersion?: string;
  readonly employeeId?: string;
  readonly profileName?: string;
  readonly fingerprint?: any;
}

export interface ReleaseResult {
  readonly status: "SUCCESS" | "FAILED" | "BLOCKED";
  readonly releaseId: string;
  readonly version: string;
  readonly deployedTargets: {
    readonly adapter: string;
    readonly destination: string;
    readonly success: boolean;
    readonly error?: string;
  }[];
  readonly verified: boolean;
  readonly error?: string;
}

export interface ReleaseEvent {
  readonly type: "RELEASE_REQUESTED" | "RELEASE_COMPLETED" | "RELEASE_FAILED" | "RELEASE_BLOCKED";
  readonly releaseId: string;
  readonly version: string;
  readonly timestamp: number;
  readonly error?: string;
}
