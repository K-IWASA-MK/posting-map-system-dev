import { PluginManifest, PluginCapability } from '../models/plugin';
import { SdkDescriptor } from './models';

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
}

/**
 * PluginValidator
 * 
 * SDK Utility for validating plugin manifests and compatibility before loading.
 * Strictly stateless. Does NOT interact with the Loader or Registry.
 */
export class PluginValidator {

  /**
   * Validates the plugin manifest structure.
   */
  static validateManifest(manifest: unknown): ValidationResult {
    const errors: string[] = [];

    if (!manifest || typeof manifest !== 'object') {
      return { isValid: false, errors: ['Manifest must be an object.'] };
    }

    const m = manifest as Record<string, unknown>;

    if (typeof m.pluginId !== 'string' || !m.pluginId) {
      errors.push('pluginId is required and must be a string.');
    }
    if (typeof m.version !== 'string' || !m.version) {
      errors.push('version is required and must be a string.');
    }
    if (typeof m.apiVersion !== 'string' || !m.apiVersion) {
      errors.push('apiVersion is required and must be a string.');
    }
    if (typeof m.kind !== 'string' || !m.kind) {
      errors.push('kind is required and must be a string.');
    }
    if (!Array.isArray(m.capabilities)) {
      errors.push('capabilities is required and must be an array.');
    }
    if (typeof m.origin !== 'string' || !m.origin) {
      errors.push('origin is required and must be a string.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates if the plugin's apiVersion is compatible with the SDK's supported API range.
   */
  static validateApiCompatibility(pluginApiVersion: string, sdk: SdkDescriptor): ValidationResult {
    // Basic semver check stub. For Generation 5, this would use an actual semver library.
    // For this Foundation, we do a simple string comparison or numeric check.
    const pluginVer = this.parseVersion(pluginApiVersion);
    const minVer = this.parseVersion(sdk.minimumApiVersion);
    const maxVer = this.parseVersion(sdk.maximumApiVersion);

    if (pluginVer < minVer) {
      return { isValid: false, errors: [`Plugin API Version ${pluginApiVersion} is older than SDK minimum ${sdk.minimumApiVersion}`] };
    }
    if (pluginVer > maxVer) {
      return { isValid: false, errors: [`Plugin API Version ${pluginApiVersion} is newer than SDK maximum ${sdk.maximumApiVersion}`] };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Validates that the capabilities declared in the manifest are supported.
   */
  static validateCapabilities(declaredCapabilities: string[]): ValidationResult {
    const errors: string[] = [];
    const validCapabilities = Object.values(PluginCapability) as string[];

    for (const cap of declaredCapabilities) {
      if (!validCapabilities.includes(cap)) {
        errors.push(`Invalid capability declared: ${cap}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static parseVersion(version: string): number {
    // Simplistic version parsing for 'v1.0' -> 1.0
    const clean = version.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  }
}
