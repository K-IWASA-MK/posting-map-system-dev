export type SandboxProfileType = 'READ_ONLY' | 'NETWORK_DISABLED' | 'LIMITED_NETWORK' | 'FULLY_ISOLATED';

export interface SandboxProfile {
  readonly profileName: SandboxProfileType;
  readonly fileAccess: 'NONE' | 'READ' | 'READ_WRITE';
  readonly networkAllowed: boolean;
  readonly allowedDomains: string[];
  readonly resourceLimits: {
    readonly cpuPercent: number;
    readonly memoryMb: number;
  };
}

export const StandardSandboxProfiles: Record<SandboxProfileType, SandboxProfile> = {
  READ_ONLY: {
    profileName: 'READ_ONLY',
    fileAccess: 'READ',
    networkAllowed: true,
    allowedDomains: ['*'],
    resourceLimits: { cpuPercent: 50, memoryMb: 512 }
  },
  NETWORK_DISABLED: {
    profileName: 'NETWORK_DISABLED',
    fileAccess: 'READ_WRITE',
    networkAllowed: false,
    allowedDomains: [],
    resourceLimits: { cpuPercent: 80, memoryMb: 1024 }
  },
  LIMITED_NETWORK: {
    profileName: 'LIMITED_NETWORK',
    fileAccess: 'READ',
    networkAllowed: true,
    allowedDomains: ['api.github.com', 'google.com'],
    resourceLimits: { cpuPercent: 40, memoryMb: 256 }
  },
  FULLY_ISOLATED: {
    profileName: 'FULLY_ISOLATED',
    fileAccess: 'NONE',
    networkAllowed: false,
    allowedDomains: [],
    resourceLimits: { cpuPercent: 10, memoryMb: 64 }
  }
};
