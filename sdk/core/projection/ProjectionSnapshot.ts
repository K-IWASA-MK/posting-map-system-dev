import { ProjectionModel } from './ProjectionModel';

export interface ProjectionSnapshot {
  readonly projection: ProjectionModel;
  readonly projectionVersion: number;
  readonly generatedAt: string;
}
