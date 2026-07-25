import { IProjectionBuilder } from './IProjectionBuilder';
import { IProjectionRepository } from './IProjectionRepository';
import { AIOSEvent } from '../event/AIOSEvent';
import { ProjectionState } from './ProjectionState';
import { ProjectionStage } from './ProjectionStage';
import { ProjectionModel } from './ProjectionModel';
import { ProjectionSnapshot } from './ProjectionSnapshot';
import { ProjectionStateMachine } from './ProjectionStateMachine';

export class ProjectionBuilder implements IProjectionBuilder {
  private repository: IProjectionRepository;

  constructor(repository: IProjectionRepository) {
    this.repository = repository;
  }

  public async build(event: AIOSEvent): Promise<void> {
    const executionId = (event.payload as any)?.executionId || event.correlationId;
    
    // Get existing snapshot or build initial one
    const existing = await this.repository.findById(executionId);
    let currentStatus = existing ? existing.projection.status : ProjectionState.READY;
    let currentVersion = existing ? existing.projectionVersion : 0;

    // Determine target state and stage from event type
    let targetStatus = currentStatus;
    let targetStage = existing ? existing.projection.currentStage : ProjectionStage.NONE;

    switch (event.eventType) {
      case 'SystemBoot':
        targetStatus = ProjectionState.BOOTING;
        targetStage = ProjectionStage.NONE;
        break;
      case 'SystemReady':
        targetStatus = ProjectionState.READY;
        targetStage = ProjectionStage.NONE;
        break;
      case 'ExecutionStarted':
        targetStatus = ProjectionState.RUNNING;
        targetStage = ProjectionStage.CONTEXT;
        break;
      case 'PluginStarted':
        targetStatus = ProjectionState.RUNNING;
        targetStage = ProjectionStage.PLUGIN;
        break;
      case 'ValidationStarted':
        targetStatus = ProjectionState.RUNNING;
        targetStage = ProjectionStage.VALIDATION;
        break;
      case 'ReviewStarted':
        targetStatus = ProjectionState.RUNNING;
        targetStage = ProjectionStage.REVIEW;
        break;
      case 'ExecutionCompleted':
        targetStatus = ProjectionState.COMPLETED;
        targetStage = ProjectionStage.COMPLETED;
        break;
      case 'ExecutionFailed':
      case 'SystemError':
        targetStatus = ProjectionState.ERROR;
        targetStage = ProjectionStage.NONE;
        break;
      default:
        // Rule: Unknown / unmapped event types are ignored
        return;
    }

    // Validate state transition using StateMachine
    if (currentStatus !== targetStatus && !ProjectionStateMachine.isValidTransition(currentStatus, targetStatus)) {
      // Invalid transition: skip update
      return;
    }

    const updatedModel: ProjectionModel = Object.freeze({
      projectionId: `PRJ-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      executionId,
      correlationId: event.correlationId,
      currentStage: targetStage,
      status: targetStatus,
      source: event.producerRuntimeId,
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0'
    });

    const snapshot: ProjectionSnapshot = Object.freeze({
      projection: updatedModel,
      projectionVersion: currentVersion + 1,
      generatedAt: new Date().toISOString()
    });

    await this.repository.save(snapshot);
  }
}

