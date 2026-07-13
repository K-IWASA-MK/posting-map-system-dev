export interface ImprovementProposal {
    proposalId: string;
    proposalType: 'PROMPT' | 'WORKFLOW' | 'ARCHITECTURE' | 'CODE' | 'CONFIGURATION';
    targetRuntime: string;
    targetVersion: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    expectedBenefit: string;
    estimatedRisk: string;
    createdBy: string;
    sourceRuntime: string;
    dependencyList: string[];
    rollbackStrategyId: string;
    patternIds?: string[];
    content: any; // Flexible payload containing the actual changes
    createdAt: string;
}
