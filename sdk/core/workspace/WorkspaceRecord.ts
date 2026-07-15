import { WorkspaceManifest } from './WorkspaceManifest';
import { WorkspaceState } from './WorkspaceState';
import { WorkspaceHealth } from './health/WorkspaceHealth';
import { WorkspaceMetrics } from './metrics/WorkspaceMetrics';
import { DependencyGraph } from './graph/DependencyGraph';

export interface WorkspaceRecord {
  id: string; // Typically the workspaceId
  manifest: WorkspaceManifest;
  state: WorkspaceState;
  health: WorkspaceHealth;
  metrics: WorkspaceMetrics;
  dependencyGraph: DependencyGraph;
}
