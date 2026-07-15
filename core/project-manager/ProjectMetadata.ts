import { ProjectInfo } from '../project-discovery/ProjectDiscoveryResult';

/**
 * ValidationResult represents the filesystem existence checks on core files.
 */
export interface ValidationResult {
  valid: boolean;
  missingFiles: string[];
}

/**
 * Warning represents a non-blocking warn event during management checks.
 */
export interface Warning {
  code: string;
  message: string;
}

/**
 * ProjectMetadata aggregates project info, validation results, status lifecycle, and warnings.
 * Extensible for future metrics such as dependencies, licensing, etc.
 */
export interface ProjectMetadata {
  project: ProjectInfo;
  validation: ValidationResult;
  lifecycle: 'development' | 'production' | 'archived';
  warnings: Warning[];
}
