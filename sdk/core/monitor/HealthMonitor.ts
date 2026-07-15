import { IMonitorService } from './IMonitorService';
import { IProjectionRepository } from '../projection/IProjectionRepository';
import { MonitorStatus } from './MonitorStatus';
import { ProjectionState } from '../projection/ProjectionState';

export class HealthMonitor implements IMonitorService {
  private projectionRepo: IProjectionRepository;

  constructor(projectionRepo: IProjectionRepository) {
    this.projectionRepo = projectionRepo;
  }

  public name(): string {
    return 'health';
  }

  public supports(queryType: string): boolean {
    return queryType === 'health';
  }

  public async query(): Promise<Record<string, any>> {
    const projections = await this.projectionRepo.findAll();
    if (projections.length === 0) {
      return { status: MonitorStatus.UNKNOWN, reason: 'No active execution records' };
    }

    // If any execution is in ERROR state, signal error overall
    const hasError = projections.some(p => p.projection.status === ProjectionState.ERROR);
    if (hasError) {
      return { status: MonitorStatus.ERROR, reason: 'One or more execution errors detected' };
    }

    const hasRunning = projections.some(p => p.projection.status === ProjectionState.RUNNING);
    if (hasRunning) {
      return { status: MonitorStatus.RUNNING };
    }

    return { status: MonitorStatus.READY };
  }
}
