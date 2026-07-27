import { ProjectDescriptor } from '../contracts/ProjectDescriptor';
import { ProjectRegistryState } from './ProjectRegistryTypes';

/**
 * ProjectRegistry serves as the Single Source of Truth (SSOT) for all registered
 * projects within AIOS Core. It maintains an in-memory map of ProjectDescriptors
 * and exposes read-only query interfaces for AI Executive and Agent Router.
 */
export class ProjectRegistry {
  private readonly projects: Map<string, ProjectDescriptor> = new Map();

  /**
   * Registers a validated ProjectDescriptor into the registry.
   * Overwrites if the project ID already exists (e.g. manifest reload).
   */
  public register(descriptor: ProjectDescriptor): void {
    if (!descriptor || !descriptor.manifest || !descriptor.manifest.projectId) {
      throw new Error('[ProjectRegistry] Cannot register invalid ProjectDescriptor or missing projectId.');
    }
    this.projects.set(descriptor.manifest.projectId, descriptor);
  }

  /**
   * Resolves a ProjectDescriptor by its unique projectId.
   */
  public resolve(projectId: string): ProjectDescriptor | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Lists all currently registered ProjectDescriptors.
   */
  public list(): readonly ProjectDescriptor[] {
    return Array.from(this.projects.values());
  }

  /**
   * Finds all ProjectDescriptors requiring a specific ProjectCapability (e.g., 'GIS', 'LIFF').
   */
  public findByCapability(capability: string): readonly ProjectDescriptor[] {
    if (!capability || capability.trim() === '') {
      return [];
    }
    const results: ProjectDescriptor[] = [];
    this.projects.forEach((descriptor) => {
      if (descriptor.manifest.capabilities.includes(capability)) {
        results.push(descriptor);
      }
    });
    return results;
  }

  /**
   * Returns a snapshot of the current registry state in an immutable structure.
   */
  public getState(): ProjectRegistryState {
    return {
      projects: new Map(this.projects),
      loadedAt: Date.now()
    };
  }

  /**
   * Clears the current registry.
   * Intended for testing or isolated runtime resets.
   */
  public clear(): void {
    this.projects.clear();
  }
}
