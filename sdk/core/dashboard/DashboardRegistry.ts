import { DashboardState, RuntimeStateProjection, WorkflowStateProjection } from './DashboardState';
import { DashboardPolicy } from './DashboardPolicy';
import { AIOSEvent } from '../event/AIOSEvent';

export class DashboardRegistry {
  private readonly state: DashboardState;

  constructor(private readonly policy: DashboardPolicy) {
    this.state = {
      runtimes: new Map(),
      workflows: new Map(),
      events: [],
      metrics: {
        runtimeMetrics: {},
        workflowMetrics: {},
        doraMetrics: {},
        queueMetrics: {}
      },
      ledger: [],
      dependencyGraph: { nodes: [], edges: [] }
    };
  }

  // Projections
  public updateRuntimeState(runtimeId: string, update: Partial<RuntimeStateProjection>): void {
    const existing = this.state.runtimes.get(runtimeId) || {
      runtimeId,
      runtimeName: 'Unknown',
      version: '1.0.0',
      status: 'UNKNOWN',
      health: 'UNKNOWN',
      uptimeMs: 0,
      lastUpdatedAt: new Date().toISOString()
    };
    
    this.state.runtimes.set(runtimeId, { ...existing, ...update, lastUpdatedAt: new Date().toISOString() });
  }

  public updateWorkflowState(workflowId: string, update: Partial<WorkflowStateProjection>): void {
    const existing = this.state.workflows.get(workflowId) || {
      workflowId,
      jobId: '',
      state: 'UNKNOWN',
      startedAt: new Date().toISOString(),
      activeSteps: [],
      completedSteps: []
    };
    
    this.state.workflows.set(workflowId, { ...existing, ...update });
  }

  public addEvent(event: AIOSEvent): void {
    this.state.events.unshift(event);
    if (this.state.events.length > this.policy.eventRetentionCount) {
      this.state.events.pop();
    }
  }

  public addLedgerEntry(entry: any): void {
    this.state.ledger.unshift(entry);
    if (this.state.ledger.length > this.policy.eventRetentionCount) {
      this.state.ledger.pop();
    }
  }

  public updateMetrics(metrics: any): void {
    this.state.metrics = { ...this.state.metrics, ...metrics };
  }

  public updateDependencyGraph(graph: any): void {
    this.state.dependencyGraph = graph;
  }

  // Getters for HTTP API
  public getRuntimes(): RuntimeStateProjection[] {
    return Array.from(this.state.runtimes.values());
  }

  public getWorkflows(): WorkflowStateProjection[] {
    return Array.from(this.state.workflows.values());
  }

  public getEvents(): AIOSEvent[] {
    return this.state.events;
  }

  public getLedger(): any[] {
    return this.state.ledger;
  }

  public getMetrics(): any {
    return this.state.metrics;
  }

  public getDependencyGraph(): any {
    return this.state.dependencyGraph;
  }
}
