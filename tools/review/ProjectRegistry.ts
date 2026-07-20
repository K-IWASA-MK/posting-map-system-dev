import * as fs from 'fs';
import * as path from 'path';

export interface ProjectManifest {
  readonly id: string;
  readonly name: string;
  readonly platformName: string;
  readonly version: string;
  readonly type: string;
}

export class ProjectRegistry {
  private static readonly projects = ['posting-map', 'hokusei-ch', '80s-disco'];

  /**
   * Returns list of registered project IDs.
   */
  public static getProjects(): string[] {
    return this.projects;
  }

  /**
   * Verifies if a project ID is registered.
   */
  public static exists(projectId: string): boolean {
    return this.projects.includes(projectId);
  }

  /**
   * Dynamically loads a project's project.json manifest file.
   * If the file is missing, yields a default fallback manifest config.
   */
  public static getManifest(projectId: string): ProjectManifest {
    if (!this.exists(projectId)) {
      throw new Error(`ProjectRegistry: Project "${projectId}" is not registered.`);
    }

    const workspaceRoot = path.resolve(__dirname, '../..');
    const manifestPath = path.join(workspaceRoot, 'projects', projectId, 'project.json');

    if (fs.existsSync(manifestPath)) {
      try {
        const content = fs.readFileSync(manifestPath, 'utf-8');
        return JSON.parse(content);
      } catch (err) {
        console.error(`[ProjectRegistry] Failed to parse manifest for "${projectId}": ${err}`);
      }
    }

    // Default fallback manifest config
    return {
      id: projectId,
      name: projectId.toUpperCase().replace('-', ' '),
      platformName: 'FIELD_OPERATIONS_PLATFORM',
      version: '1.0.0',
      type: 'application'
    };
  }
}
