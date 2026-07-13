export interface AIAgentPolicy {
    maxContextTokens: number;
    maxOutputTokens: number;
    maxReasoningSteps: number;
    allowedModels: string[];
    allowedProviders: string[];
    retryPolicy: {
        maxRetry: number;
        backoffMultiplier: number;
    };
    fallbackModel?: string;
    safetyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    hallucinationPolicy: 'HALT' | 'RETRY' | 'IGNORE';
}
