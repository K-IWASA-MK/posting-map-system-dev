import { AIOSState } from './LifecycleManager';

export interface HealthStatus {
  readonly state: AIOSState;
  readonly bootTime: string;
  readonly activeSessions: number;
  readonly components: {
    readonly pluginsLoaded: number;
    readonly reviewersLoaded: number;
    readonly ledgerConnected: boolean;
    readonly governanceReady: boolean;
  };
  readonly uptimeMs: number;
}
