import { RepositoryManifest } from '../RepositoryManifest';

export interface RuleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IRepositoryRule {
  validate(manifest: RepositoryManifest): RuleValidationResult;
}
