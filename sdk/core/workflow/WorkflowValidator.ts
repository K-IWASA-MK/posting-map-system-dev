import { WorkflowDefinition } from './WorkflowModels';
import { WorkflowGraph } from './WorkflowGraph';

export class WorkflowValidator {
  private readonly graph = new WorkflowGraph();

  public validate(workflow: WorkflowDefinition): void {
    if (!workflow.entryNode || !workflow.exitNode) {
      throw new Error(`Invalid workflow [${workflow.workflowId}]: Missing entry or exit node`);
    }

    // 1. Cycle detection using topological sort
    const order = this.graph.getTopologicalOrder(workflow.nodes, workflow.edges);

    // 2. Isolated node checking
    const { adj, inDegree } = this.graph.buildAdjacencyList(workflow.nodes, workflow.edges);
    for (const n of workflow.nodes) {
      const outDeg = (adj.get(n.nodeId) || []).length;
      const inDeg = inDegree.get(n.nodeId) || 0;
      
      // If a node has no inputs and outputs and isn't the single node itself, it's isolated
      if (inDeg === 0 && outDeg === 0 && workflow.nodes.length > 1) {
        throw new Error(`Isolated node detected: node [${n.nodeId}] is not connected in graph`);
      }
    }
  }
}
