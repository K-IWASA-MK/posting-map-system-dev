import { ProjectDescriptor } from '../contracts/ProjectDescriptor';

/**
 * Encapsulates immutable state representation of the Project Registry.
 */
export interface ProjectRegistryState {
  readonly projects: ReadonlyMap<string, ProjectDescriptor>;
  readonly loadedAt: number;
}

/**
 * Result structure returned by ManifestLoader operations.
 * Allows structured error reporting for Future ExecutionLedger & Governance integration.
 */
export interface ManifestLoadResult {
  readonly success: boolean;
  readonly projectId?: string;
  readonly descriptor?: ProjectDescriptor;
  readonly errorReason?: string;
  readonly validationErrors?: readonly string[];
}
