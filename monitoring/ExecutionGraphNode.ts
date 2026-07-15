import { ExecutionGraphNodeType } from "./ExecutionGraphNodeType";

export interface ExecutionGraphNode {
  id: string;
  type: ExecutionGraphNodeType;
  layer: string;
  metadata: Record<string, any>;
  references: string[];
}
