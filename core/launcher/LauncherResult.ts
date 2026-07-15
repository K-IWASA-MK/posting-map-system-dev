import { LaunchMode } from './LauncherRequest';

/**
 * LaunchDecision defines the policy outcomes for a launch request.
 */
export type LaunchDecision = 'allow' | 'deny';

/**
 * LauncherResult represents the outcome of the Launcher verification gate.
 */
export interface LauncherResult {
  success: boolean;
  projectId: string;
  mode: LaunchMode;
  decision: LaunchDecision;
  reasons: string[];
  errorCodes: string[];
  warnings: string[];
  bootTimestamp?: number;
}
