import { IProjectionBuilder } from './IProjectionBuilder';
import { IProjectionRepository } from './IProjectionRepository';
import { EventEnvelope } from '../eventbus/EventEnvelope';
import { EventType } from '../eventbus/EventType';
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

  public async build(envelope: EventEnvelope): Promise<void> {
    const executionId = envelope.executionId;
    
    // Get existing snapshot or build initial one
    const existing = await this.repository.findById(executionId);
    let currentStatus = existing ? existing.projection.status : ProjectionState.READY;
    let currentVersion = existing ? existing.projectionVersion : 0;

    // Determine target state and stage from event type
    let targetStatus = currentStatus;
    let targetStage = existing ? existing.projection.currentStage : ProjectionStage.NONE;

    switch (envelope.eventType) {
      case EventType.SystemBoot:
        targetStatus = ProjectionState.BOOTING;
        targetStage = ProjectionStage.NONE;
        break;
      case EventType.SystemReady:
        targetStatus = ProjectionState.READY;
        targetStage = ProjectionStage.NONE;
        break;
      case EventType.ExecutionStarted:
        targetStatus = ProjectionState.RUNNING;
        targetStage = ProjectionStage.CONTEXT;
        break;
      case EventType.PluginStarted:
        targetStatus = ProjectionState.RUNNING;
        targetStage = ProjectionStage.PLUGIN;
        break;
      case EventType.ValidationStarted:
        targetStatus = ProjectionState.RUNNING;
        targetStage = ProjectionStage.VALIDATION;
        break;
      case EventType.ReviewStarted:
        targetStatus = ProjectionState.RUNNING;
        targetStage = ProjectionStage.REVIEW;
        break;
      case EventType.ExecutionCompleted:
        targetStatus = ProjectionState.COMPLETED;
        targetStage = ProjectionStage.COMPLETED;
        break;
      case EventType.ExecutionFailed:
      case EventType.SystemError:
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
      correlationId: envelope.correlationId,
      currentStage: targetStage,
      status: targetStatus,
      source: envelope.source,
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
