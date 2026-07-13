export interface DecisionTreeNode {
    nodeId: string;
    condition: string;
    yesBranchId?: string;
    noBranchId?: string;
    decisionId?: string;
}

export interface DecisionTree {
    treeId: string;
    rootNodeId: string;
    nodes: Map<string, DecisionTreeNode>;
}
