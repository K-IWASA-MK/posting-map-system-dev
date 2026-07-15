import { RepositoryRecord } from './RepositoryRecord';
import { RepositoryType } from './RepositoryType';

export class RepositoryRegistry {
  private records = new Map<string, RepositoryRecord>();

  public register(record: RepositoryRecord): void {
    this.records.set(record.id, record);
  }

  public getById(id: string): RepositoryRecord | undefined {
    return this.records.get(id);
  }

  public getByType(type: RepositoryType): RepositoryRecord[] {
    return Array.from(this.records.values()).filter(r => r.manifest.repositoryType === type);
  }

  public getAll(): RepositoryRecord[] {
    return Array.from(this.records.values());
  }

  public unregister(id: string): void {
    this.records.delete(id);
  }
}
