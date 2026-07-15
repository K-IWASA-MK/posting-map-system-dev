import * as fs from 'fs';
import * as path from 'path';
import { DiscoveryError, ProjectInfo } from './ProjectDiscoveryResult';

/**
 * RegistryValidator validates raw registry objects against the schema constraints and physical directory structures.
 */
export class RegistryValidator {
  private static readonly KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  private static readonly VALID_STATUSES = ['development', 'production', 'archived'];

  /**
   * Validates raw registry object and directory structures under projects/ folder.
   * @param rawRegistry Raw parsed registry JSON object.
   * @param workspaceRoot Absolute path to the workspace root.
   */
  public static validate(rawRegistry: any, workspaceRoot: string): {
    success: boolean;
    projects: ProjectInfo[];
    errors: DiscoveryError[];
  } {
    const errors: DiscoveryError[] = [];
    const projects: ProjectInfo[] = [];

    // 1. Basic JSON object validation
    if (!rawRegistry || typeof rawRegistry !== 'object') {
      errors.push({ code: 'INVALID_REGISTRY', message: 'Registry must be a valid JSON object' });
      return { success: false, projects, errors };
    }

    if (!rawRegistry.version) {
      errors.push({ code: 'MISSING_VERSION', message: 'Registry is missing a version field' });
    }

    if (!rawRegistry.projects || !Array.isArray(rawRegistry.projects)) {
      errors.push({ code: 'MISSING_PROJECTS', message: 'Registry is missing projects array' });
      return { success: false, projects, errors };
    }

    const seenIds = new Set<string>();

    for (let idx = 0; idx < rawRegistry.projects.length; idx++) {
      const proj = rawRegistry.projects[idx];
      
      if (!proj || typeof proj !== 'object') {
        errors.push({ code: 'INVALID_PROJECT_ENTRY', message: `Project entry at index ${idx} is invalid` });
        continue;
      }

      const projId = proj.id;
      const projName = proj.name;
      const projStatus = proj.status;
      const projDesc = proj.description;

      if (!projId || typeof projId !== 'string') {
        errors.push({ code: 'INVALID_PROJECT_ID', message: `Project entry at index ${idx} is missing a valid id` });
        continue;
      }

      if (!projName || typeof projName !== 'string') {
        errors.push({ code: 'INVALID_PROJECT_NAME', message: `Project '${projId}' is missing a valid name`, projectId: projId });
      }

      if (!projStatus || typeof projStatus !== 'string' || !this.VALID_STATUSES.includes(projStatus)) {
        errors.push({ code: 'INVALID_PROJECT_STATUS', message: `Project '${projId}' has invalid status: '${projStatus}'`, projectId: projId });
      }

      if (projDesc !== undefined && typeof projDesc !== 'string') {
        errors.push({ code: 'INVALID_PROJECT_DESCRIPTION', message: `Project '${projId}' description must be a string`, projectId: projId });
      }

      // Validate kebab-case
      if (!this.KEBAB_CASE_REGEX.test(projId)) {
        errors.push({ code: 'INVALID_ID_FORMAT', message: `Project ID '${projId}' must be strictly kebab-case`, projectId: projId });
      }

      // Check duplicates
      if (seenIds.has(projId)) {
        errors.push({ code: 'DUPLICATE_PROJECT_ID', message: `Duplicate project ID found in registry: '${projId}'`, projectId: projId });
      } else {
        seenIds.add(projId);
      }

      // Validate directory existence
      const projectPath = path.join(workspaceRoot, 'projects', projId);
      if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
        errors.push({ code: 'MISSING_PROJECT_DIRECTORY', message: `Physical project directory does not exist for ID '${projId}'`, projectId: projId });
      } else {
        projects.push({
          id: projId,
          name: projName || '',
          status: (projStatus as 'development' | 'production' | 'archived') || 'development',
          description: projDesc || '',
          path: projectPath
        });
      }
    }

    // 2. Orphan detection (subdirectories in projects/ that are not registered in registry.json)
    const projectsDir = path.join(workspaceRoot, 'projects');
    if (fs.existsSync(projectsDir)) {
      try {
        const actualItems = fs.readdirSync(projectsDir);
        for (const item of actualItems) {
          if (item === 'registry.json' || item.startsWith('.')) {
            continue;
          }
          const itemPath = path.join(projectsDir, item);
          if (fs.statSync(itemPath).isDirectory()) {
            if (!seenIds.has(item)) {
              errors.push({ code: 'ORPHAN_PROJECT_DIRECTORY', message: `Unregistered project directory found: '${item}'`, projectId: item });
            }
          }
        }
      } catch (e: any) {
        errors.push({ code: 'FS_READ_ERROR', message: `Failed to read projects directory: ${e.message}` });
      }
    }

    return {
      success: errors.length === 0,
      projects,
      errors
    };
  }
}
