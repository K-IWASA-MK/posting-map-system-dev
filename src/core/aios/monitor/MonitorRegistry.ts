import { IMonitorService } from './IMonitorService';

export class MonitorRegistry {
  private services: IMonitorService[] = [];

  public register(service: IMonitorService): void {
    this.services.push(service);
  }

  public getAll(): IMonitorService[] {
    return [...this.services];
  }

  public findByName(name: string): IMonitorService | null {
    return this.services.find(s => s.name() === name) || null;
  }
}
