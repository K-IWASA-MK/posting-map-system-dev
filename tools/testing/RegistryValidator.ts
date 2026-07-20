import { TestAsset } from './TestAsset';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class RegistryValidator {
  private static readonly KNOWN_CAPABILITIES = new Set([
    'requiresFreshProcess',
    'requiresRegistryReset'
  ]);

  /**
   * Validates the integrity of discovered test assets.
   */
  public static validate(assets: TestAsset[], workspaceRoot: string): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    const seenIds = new Set<string>();

    for (const asset of assets) {
      // 1. Validate ID duplicates
      if (seenIds.has(asset.id)) {
        errors.push(`Duplicate Test ID detected: "${asset.id}"`);
      } else {
        seenIds.add(asset.id);
      }

      // 2. Validate physical file existence
      const fullPath = path.join(workspaceRoot, asset.module);
      if (!fs.existsSync(fullPath)) {
        errors.push(`Test file does not exist for ID "${asset.id}": Module path resolved to "${asset.module}"`);
      }

      // 3. Validate Timeout
      if (typeof asset.timeout !== 'number' || asset.timeout <= 0) {
        errors.push(`Invalid timeout for ID "${asset.id}": Timeout must be a positive number (got ${asset.timeout})`);
      }

      // 4. Validate Capabilities
      for (const cap of asset.capabilities) {
        if (!this.KNOWN_CAPABILITIES.has(cap)) {
          errors.push(`Unknown capability "${cap}" specified in test ID "${asset.id}". Known capabilities are: ${Array.from(this.KNOWN_CAPABILITIES).join(', ')}`);
        }
      }

      // 5. Add warnings for disabled tests
      if (!asset.enabled) {
        warnings.push(`Test ID "${asset.id}" is currently disabled and will be skipped in planning.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
