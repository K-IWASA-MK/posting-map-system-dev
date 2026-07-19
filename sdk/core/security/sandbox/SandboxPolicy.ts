export interface ResourcePolicy {
  readonly cpuLimit: number; // in CPU percentage, e.g. 50
  readonly memoryLimit: number; // in MB, e.g. 512
  readonly diskLimit: number; // in MB, e.g. 1000
  readonly networkPolicy: 'ALLOW_ALL' | 'DENY_ALL' | 'RESTRICTED';
  readonly filesystemPolicy: 'NONE' | 'READ' | 'READ_WRITE';
}

export interface SandboxPolicy {
  readonly policyId: string;
  readonly profileName: string;
  readonly resourcePolicy: ResourcePolicy;
}
