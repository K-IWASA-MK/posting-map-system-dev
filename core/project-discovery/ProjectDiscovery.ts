import { RegistryReader } from './RegistryReader';
import { RegistryValidator } from './RegistryValidator';
import { ProjectDiscoveryResult } from './ProjectDiscoveryResult';

/**
 * ProjectDiscovery orchestrates RegistryReader and RegistryValidator to discover and validate projects.
 * It is strictly read-only and never executes, modifies, or launches any discovered project.
 */
export class ProjectDiscovery {
  /**
   * Executes the project discovery process.
   * @param workspaceRoot Absolute path to the workspace root directory.
   */
  public static discover(workspaceRoot: string): ProjectDiscoveryResult {
    try {
      // 1. Read and parse raw registry object
      const rawRegistry = RegistryReader.readRawRegistry(workspaceRoot);

      // 2. Validate registry schema and project directories
      const validationResult = RegistryValidator.validate(rawRegistry, workspaceRoot);

      // 3. Return aggregated discovery result with future-extensible warning/error properties
      return {
        success: validationResult.success,
        count: validationResult.projects.length,
        projects: validationResult.projects,
        warnings: [], // Warnings can be populated in future sprints (e.g. deprecated versions)
        errors: validationResult.errors
      };
    } catch (e: any) {
      // Handle file resolution or JSON parse errors
      return {
        success: false,
        count: 0,
        projects: [],
        warnings: [],
        errors: [
          {
            code: 'DISCOVERY_FAILED',
            message: e.message || 'Fatal error during project discovery process'
          }
        ]
      };
    }
  }
}
