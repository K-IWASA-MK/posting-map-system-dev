import { IProjectionRepository } from './IProjectionRepository';
import { ProjectionSnapshot } from './ProjectionSnapshot';

export class InMemoryProjectionRepository implements IProjectionRepository {
  private snapshots: Map<string, ProjectionSnapshot> = new Map();

  public async save(snapshot: ProjectionSnapshot): Promise<void> {
    // Replace: always overwrite with the latest state
    this.snapshots.set(snapshot.projection.executionId, snapshot);
  }

  public async findById(executionId: string): Promise<ProjectionSnapshot | null> {
    return this.snapshots.get(executionId) || null;
  }

  public async findAll(): Promise<ProjectionSnapshot[]> {
    return Array.from(this.snapshots.values());
  }

  public async delete(executionId: string): Promise<void> {
    this.snapshots.delete(executionId);
  }

  public async exists(executionId: string): Promise<boolean> {
    return this.snapshots.has(executionId);
  }

  public async count(): Promise<number> {
    return this.snapshots.size;
  }
}
