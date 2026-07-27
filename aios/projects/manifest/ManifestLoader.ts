import * as fs from 'fs';
import * as path from 'path';
import { ProjectDescriptor } from '../contracts/ProjectDescriptor';
import { ProjectManifest } from '../contracts/ProjectManifest';
import { ManifestValidator } from '../validation/ManifestValidator';
import { ManifestLoadResult } from '../registry/ProjectRegistryTypes';
import { ProjectRegistry } from '../registry/ProjectRegistry';

export interface RegistryFileEntry {
  readonly projectId: string;
  readonly manifestPath: string;
}

export interface RegistryFileFormat {
  readonly projects: readonly RegistryFileEntry[];
}

/**
 * ManifestLoader handles parsing, validation, and loading of ProjectManifest files
 * from disk and populating ProjectRegistry instances.
 */
export class ManifestLoader {
  /**
   * Parses raw manifest content string, validates it via ManifestValidator,
   * and returns a structured ManifestLoadResult.
   */
  public static loadFromContent(
    rawContent: string,
    status: "ACTIVE" | "ARCHIVED" | "DEVELOPMENT" = "ACTIVE"
  ): ManifestLoadResult {
    try {
      const parsed = JSON.parse(rawContent) as Partial<ProjectManifest>;
      const validationResult = ManifestValidator.validate(parsed);

      if (!validationResult.valid) {
        return {
          success: false,
          projectId: parsed.projectId,
          errorReason: "MANIFEST_VALIDATION_FAILED",
          validationErrors: validationResult.errors
        };
      }

      const manifest = parsed as ProjectManifest;
      const descriptor: ProjectDescriptor = {
        manifest,
        status,
        loadedAt: Date.now()
      };

      return {
        success: true,
        projectId: manifest.projectId,
        descriptor
      };
    } catch (err: any) {
      return {
        success: false,
        errorReason: `JSON_PARSE_ERROR: ${err.message || err}`
      };
    }
  }

  /**
   * Reads a manifest JSON file from the filesystem, validates it, and returns a ManifestLoadResult.
   */
  public static loadFromFile(
    filePath: string,
    status: "ACTIVE" | "ARCHIVED" | "DEVELOPMENT" = "ACTIVE"
  ): ManifestLoadResult {
    try {
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
      if (!fs.existsSync(absolutePath)) {
        return {
          success: false,
          errorReason: `FILE_NOT_FOUND: ${filePath}`
        };
      }
      const content = fs.readFileSync(absolutePath, 'utf-8');
      return this.loadFromContent(content, status);
    } catch (err: any) {
      return {
        success: false,
        errorReason: `FILE_READ_ERROR: ${err.message || err}`
      };
    }
  }

  /**
   * Loads all projects registered in a registry JSON file (e.g. projects/registry.json)
   * and registers valid descriptors into the provided ProjectRegistry.
   *
   * @returns Array of ManifestLoadResult for each entry
   */
  public static loadFromRegistryFile(
    registryFilePath: string,
    targetRegistry: ProjectRegistry,
    baseDir?: string
  ): readonly ManifestLoadResult[] {
    const results: ManifestLoadResult[] = [];
    const absoluteRegistryPath = path.isAbsolute(registryFilePath)
      ? registryFilePath
      : path.resolve(registryFilePath);

    if (!fs.existsSync(absoluteRegistryPath)) {
      return [{
        success: false,
        errorReason: `REGISTRY_FILE_NOT_FOUND: ${registryFilePath}`
      }];
    }

    try {
      const content = fs.readFileSync(absoluteRegistryPath, 'utf-8');
      const registryData = JSON.parse(content) as RegistryFileFormat;

      if (!registryData || !Array.isArray(registryData.projects)) {
        return [{
          success: false,
          errorReason: "INVALID_REGISTRY_FILE_FORMAT"
        }];
      }

      const rootDir = baseDir || path.dirname(absoluteRegistryPath);

      for (const entry of registryData.projects) {
        if (!entry.manifestPath) {
          results.push({
            success: false,
            projectId: entry.projectId,
            errorReason: "MISSING_MANIFEST_PATH"
          });
          continue;
        }

        const manifestPath = path.isAbsolute(entry.manifestPath)
          ? entry.manifestPath
          : path.resolve(rootDir, entry.manifestPath);

        const loadResult = this.loadFromFile(manifestPath);
        if (loadResult.success && loadResult.descriptor) {
          targetRegistry.register(loadResult.descriptor);
        }
        results.push(loadResult);
      }
    } catch (err: any) {
      results.push({
        success: false,
        errorReason: `REGISTRY_LOAD_ERROR: ${err.message || err}`
      });
    }

    return results;
  }
}
