/**
 * ProjectResult.ts
 * 
 * Result model returned to a client project upon task execution completion
 */

import { ArtifactReference } from '../../artifact/types/ArtifactReference';

export interface ProjectResult {
  requestId: string;
  projectId: string;
  taskId: string;
  status: 'COMPLETED' | 'FAILED' | 'BLOCKED';
  completed: boolean;
  producedArtifacts: ArtifactReference[];
  executionSummary: string;
  errorInfo?: string;
  completedAt: string;
}
