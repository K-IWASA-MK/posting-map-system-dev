import { WorkspaceRecord } from './WorkspaceRecord';
import { WorkspaceType } from './WorkspaceType';

export class WorkspaceRegistry {
  private records = new Map<string, WorkspaceRecord>();

  public register(record: WorkspaceRecord): void {
    this.records.set(record.id, record);
  }

  public getById(id: string): WorkspaceRecord | undefined {
    return this.records.get(id);
  }

  public getByType(type: WorkspaceType): WorkspaceRecord[] {
    return Array.from(this.records.values()).filter(r => r.manifest.workspaceType === type);
  }

  public getAll(): WorkspaceRecord[] {
    return Array.from(this.records.values());
  }

  public unregister(id: string): void {
    this.records.delete(id);
  }
}
