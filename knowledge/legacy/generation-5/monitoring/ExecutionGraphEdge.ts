export interface ExecutionGraphEdge {
  from: string;
  to: string;
  relationType: string;
  weight: number;
  metadata: Record<string, any>;
}
