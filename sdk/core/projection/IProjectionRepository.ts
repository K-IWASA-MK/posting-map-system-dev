import { ProjectionSnapshot } from './ProjectionSnapshot';

export interface IProjectionRepository {
  save(snapshot: ProjectionSnapshot): Promise<void>;
  findById(executionId: string): Promise<ProjectionSnapshot | null>;
  findAll(): Promise<ProjectionSnapshot[]>;
  delete(executionId: string): Promise<void>;
  exists(executionId: string): Promise<boolean>;
  count(): Promise<number>;
}
