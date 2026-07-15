import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeCapability } from '../runtime/RuntimeCapability';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeEventPublisher } from '../runtime/RuntimeEventPublisher';
import { RuntimeEventSubscriber } from '../runtime/RuntimeEventSubscriber';
import { RuntimeHealth, RuntimeHealthStatus } from '../runtime/RuntimeHealth';
import { IAIOSEventBus } from '../event/AIOSEventBus';
import { ProjectManifest } from './ProjectManifest';
import { Project, ProjectEntityState } from './ProjectModels';
import { ProjectRegistry } from './ProjectRegistry';
import { ProjectStateMachine } from './ProjectStateMachine';
import { ProjectLedger, ProjectLedgerEntryType } from './ledger/ProjectLedger';
import { ProjectMetricsCollector, ProjectMetrics } from './metrics/ProjectMetricsCollector';
import { ProjectIssueService, ProjectSprintService } from './services/ProjectService';
import { ProjectPolicy, DefaultProjectPolicy } from './policy/ProjectPolicy';

export class ProjectRuntime implements IRuntime<ProjectManifest, Project> {
  public readonly descriptor: RuntimeDescriptor = {
    runtimeId: 'core.runtime.project',
    runtimeName: 'Project Runtime',
    version: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.CAN_PLAN],
    dependencies: []
  };

  private context?: RuntimeContext;
  private publisher?: RuntimeEventPublisher;
  private subscriber?: RuntimeEventSubscriber;

  constructor(
    private registry: ProjectRegistry,
    private stateMachine: ProjectStateMachine,
    private ledger: ProjectLedger,
    private metricsCollector: ProjectMetricsCollector,
    private issueService: ProjectIssueService,
    private sprintService: ProjectSprintService,
    private policy: ProjectPolicy = DefaultProjectPolicy,
    private eventBus?: IAIOSEventBus
  ) {}

  public async initialize(context: RuntimeContext): Promise<void> {
    this.context = context;
    if (this.eventBus) {
      this.publisher = new RuntimeEventPublisher(this.descriptor.runtimeId, this.eventBus);
      this.subscriber = new RuntimeEventSubscriber(this.descriptor.runtimeId, this.eventBus);

      // Listen for workspace events or other integration points
      this.subscriber.subscribe('WorkspaceInitializedEvent', async (event: any) => {
        console.log(`[ProjectRuntime] Received WorkspaceInitializedEvent for ${event.payload.workspaceId}`);
      });
    }
  }

  public async validate(manifest: ProjectManifest): Promise<void> {
    if (!manifest.projectName) {
      throw new Error('Project name is required');
    }
  }

  public async execute(manifest: ProjectManifest): Promise<Project> {
    await this.validate(manifest);

    const project: Project = {
      id: manifest.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      workspaceId: manifest.workspaceId,
      name: manifest.projectName,
      description: manifest.description,
      state: ProjectEntityState.NEW,
      roadmap: { id: `roadmap-${Date.now()}`, epics: [] },
      backlog: { id: `backlog-${Date.now()}`, issues: [] },
      sprints: [],
      milestones: [],
      createdAt: new Date().toISOString()
    };

    this.registry.register(project);
    this.stateMachine.validateTransition(project.state, ProjectEntityState.ACTIVE);
    project.state = ProjectEntityState.ACTIVE;
    this.registry.update(project.id, { state: project.state });
    this.ledger.append(ProjectLedgerEntryType.PROJECT_CREATED, project.id);

    if (this.publisher) {
      await this.publisher.publish(
        'ProjectCreatedEvent',
        { projectId: project.id },
        this.context?.executionId || 'unknown',
        this.context?.executionId || 'unknown'
      );
    }

    return project;
  }

  public async pause(): Promise<void> {}
  public async resume(): Promise<void> {}

  public async shutdown(): Promise<void> {
    if (this.subscriber) {
      this.subscriber.unsubscribeAll();
    }
  }

  public async getHealth(): Promise<RuntimeHealth> {
    return {
      status: RuntimeHealthStatus.HEALTHY,
      lastCheckedAt: new Date().toISOString()
    };
  }

  public getMetrics(projectId: string): ProjectMetrics {
    const project = this.registry.getById(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    return this.metricsCollector.collectMetrics(project);
  }
}
