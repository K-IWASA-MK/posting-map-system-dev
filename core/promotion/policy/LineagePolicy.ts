export interface LineagePolicy {
  maxDepth: number;
  requireContinuousDAG: boolean;
  trackDomainEdges: boolean;
}
