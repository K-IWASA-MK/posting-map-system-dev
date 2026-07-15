import { IRepositoryRule, RuleValidationResult } from './IRepositoryRule';
import { RepositoryManifest } from '../RepositoryManifest';

export class RepositoryVisibilityRule implements IRepositoryRule {
  public validate(manifest: RepositoryManifest): RuleValidationResult {
    const errors: string[] = [];

    if (manifest.visibility !== 'private') {
      errors.push(`Repository visibility must be 'private'. Received: ${manifest.visibility}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}
