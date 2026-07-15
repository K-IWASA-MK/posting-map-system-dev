import { AIAgentManifest } from './AIAgentManifest';
import { AgentProfile } from './AgentProfile';

export class AIAgentRegistry {
    private agents: Map<string, AIAgentManifest> = new Map();

    public registerAgent(manifest: AIAgentManifest): void {
        this.agents.set(manifest.agentId, manifest);
    }

    public getAgent(agentId: string): AIAgentManifest | undefined {
        return this.agents.get(agentId);
    }

    /**
     * Capability Resolver: Finds an agent that has a specific capability.
     */
    public resolveByCapability(capability: string): AIAgentManifest | undefined {
        for (const agent of this.agents.values()) {
            if (agent.profile.capabilities.includes(capability)) {
                return agent;
            }
        }
        return undefined;
    }

    /**
     * Resolves an agent by their Role.
     */
    public resolveByRole(role: string): AIAgentManifest | undefined {
        for (const agent of this.agents.values()) {
            if (agent.profile.role === role) {
                return agent;
            }
        }
        return undefined;
    }
}
