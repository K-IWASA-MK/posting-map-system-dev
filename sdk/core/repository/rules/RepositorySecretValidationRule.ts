import { IRepositoryRule, RuleValidationResult } from './IRepositoryRule';
import { RepositoryManifest } from '../RepositoryManifest';

export class RepositorySecretValidationRule implements IRepositoryRule {
  public validate(manifest: RepositoryManifest): RuleValidationResult {
    const errors: string[] = [];

    // Basic heuristic: check if any string values look like secrets
    const jsonString = JSON.stringify(manifest);
    if (jsonString.includes('sk-') || jsonString.includes('ghp_') || /(password|secret|token)":"/i.test(jsonString)) {
      errors.push(`Manifest appears to contain hardcoded secrets or forbidden patterns.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}
