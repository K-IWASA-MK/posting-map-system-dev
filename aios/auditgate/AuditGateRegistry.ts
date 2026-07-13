import { AuditSignal } from "./AuditSignal";

export class AuditGateRegistry {
  private signals: Map<string, AuditSignal> = new Map();

  public async registerSignal(signal: AuditSignal): Promise<boolean> {
    if (this.signals.has(signal.id)) {
      return false;
    }
    this.signals.set(signal.id, signal);
    return true;
  }

  public async findSignal(id: string): Promise<AuditSignal | null> {
    return this.signals.get(id) || null;
  }

  public async listSignals(): Promise<AuditSignal[]> {
    return Array.from(this.signals.values());
  }

  public async removeSignal(id: string): Promise<boolean> {
    return this.signals.delete(id);
  }
}
