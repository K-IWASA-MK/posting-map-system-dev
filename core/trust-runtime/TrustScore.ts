import { TrustLevel } from './TrustLevel';

/**
 * TrustScore combines the calculated numeric score with its respective classification level.
 */
export interface TrustScore {
  readonly value: number; // 0 - 100
  readonly level: TrustLevel;
}
