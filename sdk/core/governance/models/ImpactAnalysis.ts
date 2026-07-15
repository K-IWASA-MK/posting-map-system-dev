export interface ImpactAnalysis {
    analysisId: string;
    requestId: string;
    affectedRuntimes: string[];
    affectedModules: string[];
    affectedContracts: string[];
    affectedAPIs: string[];
    breakingChange: boolean;
    migrationRequired: boolean;
    compatibilityScore: number;
    analyzedAt: string;
}
