export interface ISemanticEdge {
  readonly edgeId: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly type: string;
  readonly properties: Readonly<Record<string, unknown>>;
}
