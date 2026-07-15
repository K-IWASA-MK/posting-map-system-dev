import { ISemanticNode } from './ISemanticNode';
import { ISemanticEdge } from './ISemanticEdge';

export interface KnowledgeSemantic {
  readonly nodes: ReadonlyArray<ISemanticNode>;
  readonly edges: ReadonlyArray<ISemanticEdge>;
}
