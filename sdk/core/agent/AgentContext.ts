export interface AgentContext {
    conversationId: string;
    variables: Record<string, any>;
    artifacts: string[]; // references to artifact IDs
    history: any[]; // Chat history or similar structure
    decisions: string[]; // references to DecisionRecords
    knowledge: string[]; // references to knowledge integration items
    promptHash?: string; // Latest executed prompt hash
}
