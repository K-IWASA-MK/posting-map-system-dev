import { ProjectCapability } from './ProjectCapability';
import { ProjectRuntimePolicy } from './ProjectRuntimePolicy';

/**
 * ProjectManifest is the formal contract provided by a Project to AIOS.
 * It declaratively specifies what the project is, what capabilities it requires,
 * and the runtime constraints it imposes.
 */
export interface ProjectManifest {
  /**
   * Version of the manifest specification for future compatibility management.
   */
  readonly manifestVersion: string;

  /**
   * Unique identifier for the project (e.g., 'core-app').
   */
  readonly projectId: string;

  /**
   * Human-readable name of the project.
   */
  readonly projectName: string;

  /**
   * The current version of the project itself.
   */
  readonly version: string;

  /**
   * A brief description of the project's domain and purpose.
   */
  readonly description: string;

  /**
   * Capabilities required from AI Employees to operate on this project.
   */
  readonly capabilities: readonly ProjectCapability[];

  /**
   * Runtime execution policies and constraints.
   */
  readonly runtimePolicy: ProjectRuntimePolicy;
}
