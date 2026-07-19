import { ConsoleState, RuntimeStateProjection, WorkflowStateProjection } from './ConsoleState';
import { ConsolePolicy } from './ConsolePolicy';
import { AIOSEvent } from '../event/AIOSEvent';

export class ConsoleRegistry {
  private readonly state: ConsoleState;

  constructor(private readonly policy: ConsolePolicy) {
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
    return Array.from(this.state.runtimes.values()).map(r => Object.freeze({ ...r }));
  }

  public getWorkflows(): WorkflowStateProjection[] {
    return Array.from(this.state.workflows.values()).map(w => Object.freeze({ ...w }));
  }

  public getEvents(): AIOSEvent[] {
    return this.state.events.map(e => Object.freeze({ ...e }));
  }

  public getLedger(): any[] {
    return this.state.ledger.map(l => Object.freeze({ ...l }));
  }

  public getMetrics(): any {
    return Object.freeze({ ...this.state.metrics });
  }

  public getDependencyGraph(): any {
    return Object.freeze({ ...this.state.dependencyGraph });
  }
}
