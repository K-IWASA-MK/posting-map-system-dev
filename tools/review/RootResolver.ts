import * as path from 'path';
import { ProjectContext, PlatformContext } from './ProjectContext';
import { ProjectRegistry } from './ProjectRegistry';

export class RootResolver {
  private static readonly platformCache = new Map<string, PlatformContext>();

  /**
   * Resolves the workspace root path of AIOS.
   */
  public static resolveWorkspace(): string {
    return path.resolve(__dirname, '../..');
  }

  /**
   * Resolves the absolute project root path.
   */
  public static resolveProject(projectId: string): string {
    if (!ProjectRegistry.exists(projectId)) {
      throw new Error(`RootResolver: Project ID "${projectId}" is not registered in AIOS ProjectRegistry.`);
    }
    return path.join(this.resolveWorkspace(), 'projects', projectId);
  }

  /**
   * Resolves the absolute platform context (with caching).
   */
  public static getPlatformContext(projectId: string): PlatformContext {
    const cached = this.platformCache.get(projectId);
    if (cached) {
      return cached;
    }

    const projectRoot = this.resolveProject(projectId);
    const manifest = ProjectRegistry.getManifest(projectId);

    const projectContext: ProjectContext = {
      projectId,
      projectRoot,
      workspaceRoot: this.resolveWorkspace()
    };

    const platformContext: PlatformContext = {
      project: projectContext,
      platformName: manifest.platformName,
      platformRoot: path.join(projectRoot, manifest.platformName)
    };

    // Cache the resolved context for O(1) secondary lookups
    this.platformCache.set(projectId, platformContext);
    return platformContext;
  }

  /**
   * Resolves the absolute path to the project's operational platform root.
   */
  public static resolvePlatform(projectId: string): string {
    return this.getPlatformContext(projectId).platformRoot;
  }

  /**
   * Resolves the absolute path to the project's applications folder.
   */
  public static resolveApp(projectId: string): string {
    return path.join(this.resolveProject(projectId), 'apps');
  }
}
