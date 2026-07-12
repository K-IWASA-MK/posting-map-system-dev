import { ProjectionState } from './ProjectionState';
import { ProjectionStage } from './ProjectionStage';

export interface ProjectionModel {
  readonly projectionId: string;
  readonly executionId: string;
  readonly correlationId: string;
  readonly currentStage: ProjectionStage;
  readonly status: ProjectionState;
  readonly source: string;
  readonly updatedAt: string;
  readonly schemaVersion: string;
}
