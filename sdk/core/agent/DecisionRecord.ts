export interface DecisionRecord {
    decisionId: string;
    agentId: string;
    contextId: string; // link to Conversation/Workflow
    decisionReason: string;
    decisionConfidence: number; // 0.0 to 1.0
    decisionSource: string; // e.g., 'LLM_REASONING', 'FALLBACK_POLICY'
    decisionHash: string;
    timestamp: string;
    metadata?: Record<string, any>;
}
