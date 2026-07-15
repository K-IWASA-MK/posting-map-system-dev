export interface Inference {
    inferenceId: string;
    sourceNodeIds: string[]; // evidence or hypothesis IDs
    targetNodeId: string;    // hypothesis or decision ID
    ruleApplied?: string;
    inferredAt: string;
}
