import { WorkflowDefinition, WorkflowNode, WorkflowCheckpoint, WorkflowNodeStatus } from './WorkflowModels';
import { WorkflowGraph } from './WorkflowGraph';

export class WorkflowExecutor {
  private readonly graph = new WorkflowGraph();
  private checkpoints = new Map<string, WorkflowCheckpoint[]>();
  private nodeStatuses = new Map<string, WorkflowNodeStatus>();

  public addCheckpoint(checkpoint: WorkflowCheckpoint): void {
    const list = this.checkpoints.get(checkpoint.workflowId) || [];
    list.push(checkpoint);
    this.checkpoints.set(checkpoint.workflowId, list);
  }

  public getCheckpoints(workflowId: string): WorkflowCheckpoint[] {
    return this.checkpoints.get(workflowId) || [];
  }

  public getNodeStatus(nodeId: string): WorkflowNodeStatus {
    return this.nodeStatuses.get(nodeId) || 'PENDING';
  }

  public async executeWorkflow(
    workflow: WorkflowDefinition,
    resumeCheckpointId?: string
  ): Promise<string[]> {
    const order = this.graph.getTopologicalOrder(workflow.nodes, workflow.edges);
    const executed: string[] = [];

    let skipIndex = -1;
    if (resumeCheckpointId) {
      const list = this.checkpoints.get(workflow.workflowId) || [];
      const cp = list.find(c => c.checkpointId === resumeCheckpointId);
      if (cp) {
        // Skip nodes up to the checkpoint nodeId (exclusive or inclusive - let's make it inclusive to restart execution from cp.nodeId onwards)
        skipIndex = order.indexOf(cp.nodeId);
      }
    }

    for (let i = 0; i < order.length; i++) {
      const nodeId = order[i];
      if (i < skipIndex) {
        // Skipped because already completed before checkpoint node
        this.nodeStatuses.set(nodeId, 'COMPLETED');
        executed.push(nodeId);
        continue;
      }

      this.nodeStatuses.set(nodeId, 'RUNNING');
      // Simulate node execution
      executed.push(nodeId);
      this.nodeStatuses.set(nodeId, 'COMPLETED');

      // Register checkpoint at each node complete
      const checkpoint: WorkflowCheckpoint = {
        checkpointId: `CP-${workflow.workflowId}-${nodeId}-${Date.now()}`,
        workflowId: workflow.workflowId,
        nodeId,
        executionState: { status: 'COMPLETED' },
        createdAt: new Date().toISOString()
      };
      this.addCheckpoint(checkpoint);
    }

    return executed;
  }
}
