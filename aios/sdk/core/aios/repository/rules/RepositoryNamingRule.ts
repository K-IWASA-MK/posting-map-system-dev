import { IRepositoryRule, RuleValidationResult } from './IRepositoryRule';
import { RepositoryManifest } from '../RepositoryManifest';
import { RepositoryType } from '../RepositoryType';

export class RepositoryNamingRule implements IRepositoryRule {
  public validate(manifest: RepositoryManifest): RuleValidationResult {
    const errors: string[] = [];
    const name = manifest.repositoryName;

    switch (manifest.repositoryType) {
      case RepositoryType.CORE:
        if (name !== 'aios-core') {
          errors.push(`Repository of type CORE must be named 'aios-core'. Received: ${name}`);
        }
        break;
      case RepositoryType.PLUGIN:
        if (!name.endsWith('-system') && !name.endsWith('-plugin')) {
          errors.push(`Repository of type PLUGIN must end with '-system' or '-plugin'. Received: ${name}`);
        }
        break;
      case RepositoryType.WORKER:
        if (!name.startsWith('aios-worker-')) {
          errors.push(`Repository of type WORKER must start with 'aios-worker-'. Received: ${name}`);
        }
        break;
      case RepositoryType.SDK:
        if (!name.startsWith('aios-sdk')) {
          errors.push(`Repository of type SDK must start with 'aios-sdk'. Received: ${name}`);
        }
        break;
      case RepositoryType.APPLICATION:
        // Any name is permitted, but usually we recommend a specific pattern.
        // No explicit errors.
        break;
      default:
        errors.push(`Unknown repository type: ${manifest.repositoryType}`);
    }

    // Additional generic naming constraints (no uppercase, no special chars except hyphens)
    if (!/^[a-z0-9-]+$/.test(name)) {
      errors.push(`Repository name must contain only lowercase alphanumeric characters and hyphens. Received: ${name}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}
