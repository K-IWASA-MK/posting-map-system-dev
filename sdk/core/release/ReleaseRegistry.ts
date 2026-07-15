import { ReleaseManifest } from './ReleaseManifest';
import { ReleaseState } from './ReleaseState';

export interface ReleaseRecord {
  id: string;
  manifest: ReleaseManifest;
  state: ReleaseState;
  createdAt: string;
  updatedAt: string;
}

export class ReleaseRegistry {
  private records = new Map<string, ReleaseRecord>();

  public register(record: ReleaseRecord): void {
    if (this.records.has(record.id)) {
      throw new Error(`Release ${record.id} already exists`);
    }
    this.records.set(record.id, record);
  }

  public getById(id: string): ReleaseRecord | undefined {
    return this.records.get(id);
  }

  public update(id: string, updates: Partial<ReleaseRecord>): void {
    const record = this.getById(id);
    if (!record) {
      throw new Error(`Release ${id} not found`);
    }
    this.records.set(id, { ...record, ...updates, updatedAt: new Date().toISOString() });
  }

  public list(): ReleaseRecord[] {
    return Array.from(this.records.values());
  }

  public unregister(id: string): void {
    this.records.delete(id);
  }
}
