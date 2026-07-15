import { IRepositoryRule, RuleValidationResult } from './IRepositoryRule';
import { RepositoryManifest } from '../RepositoryManifest';

export class RepositoryOwnerRule implements IRepositoryRule {
  private readonly ALLOWED_OWNERS = ['K-IWASA-MK', 'area-management'];

  public validate(manifest: RepositoryManifest): RuleValidationResult {
    const errors: string[] = [];

    if (!this.ALLOWED_OWNERS.includes(manifest.owner)) {
      errors.push(`Repository owner must be one of [${this.ALLOWED_OWNERS.join(', ')}]. Received: ${manifest.owner}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}
