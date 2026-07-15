import { ProjectDiscoveryResult } from '../project-discovery/ProjectDiscoveryResult';
import { ProjectMetadata } from './ProjectMetadata';
import { ProjectValidation } from './ProjectValidation';
import { ProjectLifecycle } from './ProjectLifecycle';

/**
 * ProjectManager orchestrates project metadata aggregation, filesystem validation,
 * and lifecycle transitions based solely on ProjectDiscoveryResult input.
 */
export class ProjectManager {
  private readonly projectsMetadata: Map<string, ProjectMetadata> = new Map();

  /**
   * Initializes the manager using Discovery results.
   * Does NOT read projects/ registry files directly.
   * @param discoveryResult The result of a ProjectDiscovery process.
   */
  constructor(discoveryResult: ProjectDiscoveryResult) {
    if (discoveryResult && discoveryResult.success) {
      for (const proj of discoveryResult.projects) {
        const validation = ProjectValidation.validateFilesystem(proj.path);
        
        this.projectsMetadata.set(proj.id, {
          project: proj,
          validation,
          lifecycle: proj.status,
          warnings: []
        });
      }
    }
  }

  /**
   * Lists all managed projects.
   */
  public listProjects(): ProjectMetadata[] {
    return Array.from(this.projectsMetadata.values());
  }

  /**
   * Retrieves metadata of a single project by its ID.
   * @param id Project ID.
   */
  public getProject(id: string): ProjectMetadata | undefined {
    return this.projectsMetadata.get(id);
  }

  /**
   * Filters and lists projects matching the given lifecycle status.
   * @param status Lifecycle status value.
   */
  public listProjectsByStatus(status: 'development' | 'production' | 'archived'): ProjectMetadata[] {
    return this.listProjects().filter(m => m.lifecycle === status);
  }

  /**
   * Attempts to transition the lifecycle status of a managed project.
   * Prohibits backward transitions using the State Machine.
   * @param id Project ID.
   * @param targetStatus Proposed lifecycle status.
   * @returns true if transition succeeded, false if disallowed or project not found.
   */
  public transitionStatus(
    id: string,
    targetStatus: 'development' | 'production' | 'archived'
  ): boolean {
    const meta = this.projectsMetadata.get(id);
    if (!meta) {
      return false;
    }

    const currentStatus = meta.lifecycle;
    if (ProjectLifecycle.isTransitionAllowed(currentStatus, targetStatus)) {
      meta.lifecycle = targetStatus;
      // Sync the underlying project info status field
      meta.project.status = targetStatus;
      return true;
    }

    return false;
  }
}
