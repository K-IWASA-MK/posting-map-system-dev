export type BridgeStatus = 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED' | 'UNKNOWN' | 'INITIALIZING';

export const BridgeStatus = {
  CONNECTED: 'CONNECTED' as BridgeStatus,
  DISCONNECTED: 'DISCONNECTED' as BridgeStatus,
  DEGRADED: 'DEGRADED' as BridgeStatus,
  UNKNOWN: 'UNKNOWN' as BridgeStatus,
  INITIALIZING: 'INITIALIZING' as BridgeStatus
};
