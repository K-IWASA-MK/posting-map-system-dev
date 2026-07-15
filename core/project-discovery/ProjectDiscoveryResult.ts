/**
 * ProjectInfo interface represents a validated project entry in the registry.
 */
export interface ProjectInfo {
  id: string;
  name: string;
  status: 'development' | 'production' | 'archived';
  description: string;
  path: string;
}

/**
 * DiscoveryWarning represents a non-blocking warn event during discovery.
 */
export interface DiscoveryWarning {
  code: string;
  message: string;
  projectId?: string;
}

/**
 * DiscoveryError represents a blocking error event during discovery.
 */
export interface DiscoveryError {
  code: string;
  message: string;
  projectId?: string;
}

/**
 * ProjectDiscoveryResult represents the structured result of the Project Discovery process.
 */
export interface ProjectDiscoveryResult {
  success: boolean;
  count: number;
  projects: ProjectInfo[];
  warnings: DiscoveryWarning[];
  errors: DiscoveryError[];
}
