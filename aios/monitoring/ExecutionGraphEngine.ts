import { ExecutionGraphNode } from "./ExecutionGraphNode";
import { ExecutionGraphEdge } from "./ExecutionGraphEdge";
import { ExecutionGraphContext } from "./ExecutionGraphContext";

export interface IExecutionGraphEngine {
  buildGraph(context: ExecutionGraphContext): Promise<boolean>;
  addNode(node: ExecutionGraphNode): Promise<boolean>;
  addEdge(edge: ExecutionGraphEdge): Promise<boolean>;
  resolveGraph(id: string): Promise<Record<string, any> | null>;
}

export abstract class BaseExecutionGraphEngine implements IExecutionGraphEngine {
  abstract buildGraph(context: ExecutionGraphContext): Promise<boolean>;
  abstract addNode(node: ExecutionGraphNode): Promise<boolean>;
  abstract addEdge(edge: ExecutionGraphEdge): Promise<boolean>;
  abstract resolveGraph(id: string): Promise<Record<string, any> | null>;
}
