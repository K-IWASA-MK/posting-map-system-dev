import { ProjectManifest } from './ProjectManifest';

/**
 * ProjectDescriptor is a lightweight metadata representation used by the ProjectRegistry.
 * It wraps the ProjectManifest with AIOS-specific state information.
 */
export interface ProjectDescriptor {
  /**
   * The parsed manifest contract from the project.
   */
  readonly manifest: ProjectManifest;

  /**
   * Current operational status of the project within AIOS.
   */
  readonly status: "ACTIVE" | "ARCHIVED" | "DEVELOPMENT";

  /**
   * Timestamp when the project manifest was loaded into the registry.
   */
  readonly loadedAt: number;
}
