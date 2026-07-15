export interface ISemanticNode {
  readonly nodeId: string;
  readonly label: string;
  readonly type: string;
  readonly properties: Readonly<Record<string, unknown>>;
}
