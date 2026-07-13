export type AgentRole = 'Reviewer' | 'Planner' | 'Architect' | 'Security Auditor' | 'Release Manager' | 'Deployment Manager' | 'Document Writer' | 'Quality Engineer' | 'CEO Agent' | 'PM Agent';

export interface AgentProfile {
    role: AgentRole;
    capabilities: string[];
    systemPrompt: string;
    allowedTools: string[];
    policy: {
        maxReasoningSteps: number;
        temperature: number;
    };
}
