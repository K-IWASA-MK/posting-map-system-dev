import { DownloadedPlugin } from '../../remote/models';
import { TrustResult } from '../../trust/models';
import { IPlugin } from '../../../models/plugin';

/**
 * TrustedPlugin acts as the single source of truth for the Loader.
 * It combines the downloaded artifact and the finalized trust evaluation.
 */
export interface TrustedPlugin {
  readonly plugin: DownloadedPlugin;
  readonly trust: TrustResult;
}

/**
 * PluginContext bridges the TrustedPlugin to the execution environment.
 * In Generation 6, this becomes the primary interface for Kernel coordination.
 */
export interface PluginContext {
  readonly runtimeId: string;
  readonly sandboxId: string;
  readonly memoryLimit: number;
  readonly trustScore: number;
  readonly executionPolicy: string;
}

/**
 * PluginLoadRequest is the primary internal request to initiate loading.
 */
export interface PluginLoadRequest {
  readonly requestedAt: string;
  readonly requestId: string; // Correlation ID for Execution Ledger
  readonly trustedPlugin: TrustedPlugin;
}

/**
 * PluginLoadResult is the outcome of the PluginLoader pipeline.
 */
export interface PluginLoadResult {
  readonly success: boolean;
  readonly plugin?: IPlugin;
  readonly error?: string;
}
