import { IMonitorService } from './IMonitorService';
import { IProjectionRepository } from '../projection/IProjectionRepository';
import { ProjectionState } from '../projection/ProjectionState';

export class SessionMonitor implements IMonitorService {
  private projectionRepo: IProjectionRepository;

  constructor(projectionRepo: IProjectionRepository) {
    this.projectionRepo = projectionRepo;
  }

  public name(): string {
    return 'sessions';
  }

  public supports(queryType: string): boolean {
    return queryType === 'sessions';
  }

  public async query(): Promise<Record<string, any>> {
    const projections = await this.projectionRepo.findAll();

    let active = 0;
    let completed = 0;
    let failed = 0;

    for (const snap of projections) {
      const status = snap.projection.status;
      if (status === ProjectionState.RUNNING || status === ProjectionState.BOOTING || status === ProjectionState.READY) {
        active++;
      } else if (status === ProjectionState.COMPLETED) {
        completed++;
      } else if (status === ProjectionState.ERROR) {
        failed++;
      }
    }

    return {
      active,
      completed,
      failed
    };
  }
}
