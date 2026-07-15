import { AgentProfile } from './AgentProfile';

export interface AIAgentManifest {
    agentId: string;
    name: string;
    description: string;
    version: string;
    profile: AgentProfile;
    dependencies: string[];
}
