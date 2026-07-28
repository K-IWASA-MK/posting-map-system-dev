/**
 * AgentRegistry.ts
 * 
 * AIOS Task Dispatcher Agent Registry
 * Model-agnostic, immutable agent registry providing registered AgentProfiles.
 */

import { AgentProfile, CapabilityType } from '../models/AgentModels';

export class AgentRegistry {
  private readonly agents: ReadonlyMap<string, AgentProfile>;

  constructor(initialAgents: ReadonlyArray<AgentProfile> = []) {
    const map = new Map<string, AgentProfile>();
    for (const agent of initialAgents) {
      map.set(agent.agentId, Object.freeze({ ...agent }));
    }
    this.agents = map;
    Object.freeze(this);
  }

  /**
   * Retrieves all registered agent profiles.
   */
  public getAllAgents(): ReadonlyArray<AgentProfile> {
    return Object.freeze(Array.from(this.agents.values()));
  }

  /**
   * Looks up an agent profile by agentId.
   */
  public getAgentById(agentId: string): AgentProfile | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Finds agents supporting a specific role.
   */
  public findAgentsByRole(role: string): ReadonlyArray<AgentProfile> {
    const matches: AgentProfile[] = [];
    for (const agent of this.agents.values()) {
      if (agent.supportedRoles.includes(role)) {
        matches.push(agent);
      }
    }
    return Object.freeze(matches);
  }

  /**
   * Immutably registers a new agent profile, returning a new AgentRegistry instance.
   */
  public registerAgent(profile: AgentProfile): AgentRegistry {
    const updated = Array.from(this.agents.values()).concat(profile);
    return new AgentRegistry(updated);
  }

  /**
   * Creates a default agent registry pre-populated with standard AIOS agents.
   */
  public static createDefaultRegistry(): AgentRegistry {
    const defaultAgents: AgentProfile[] = [
      {
        agentId: 'AGENT-GEMINI-FLASH',
        agentName: 'Gemini Flash Employee',
        provider: 'Google DeepMind',
        supportedRoles: Object.freeze(['IMPLEMENTATION_ENGINEER', 'RESEARCH_ANALYST', 'GENERAL_ASSISTANT']),
        capabilities: Object.freeze<ReadonlyArray<CapabilityType>>(['TYPESCRIPT', 'TESTING', 'FILE_SYSTEM', 'GIT']),
        priorityWeight: 1.0
      },
      {
        agentId: 'AGENT-CLAUDE-SONNET',
        agentName: 'Claude Sonnet Employee',
        provider: 'Anthropic',
        supportedRoles: Object.freeze(['IMPLEMENTATION_ENGINEER', 'ARCHITECTURE_DESIGNER', 'REVIEW_ENGINEER', 'PLANNING_LEAD']),
        capabilities: Object.freeze<ReadonlyArray<CapabilityType>>(['TYPESCRIPT', 'ARCHITECTURE', 'DOCUMENTATION', 'TESTING', 'SECURITY', 'GIT', 'STATIC_ANALYSIS']),
        priorityWeight: 1.2
      },
      {
        agentId: 'AGENT-GPT-4O',
        agentName: 'GPT-4o Employee',
        provider: 'OpenAI',
        supportedRoles: Object.freeze(['PLANNING_LEAD', 'AUDIT_OFFICER', 'RESEARCH_ANALYST', 'REVIEW_ENGINEER']),
        capabilities: Object.freeze<ReadonlyArray<CapabilityType>>(['DOCUMENTATION', 'ARCHITECTURE', 'AUDIT_LOG_READER', 'SECURITY', 'BROWSER_AUTOMATION']),
        priorityWeight: 1.1
      },
      {
        agentId: 'AGENT-ANTIGRAVITY-CORE',
        agentName: 'Antigravity Core Autonomous Agent',
        provider: 'AIOS System',
        supportedRoles: Object.freeze(['IMPLEMENTATION_ENGINEER', 'REVIEW_ENGINEER', 'AUDIT_OFFICER', 'ARCHITECTURE_DESIGNER']),
        capabilities: Object.freeze<ReadonlyArray<CapabilityType>>(['TYPESCRIPT', 'PYTHON', 'ARCHITECTURE', 'TESTING', 'SECURITY', 'GIT', 'DOCUMENTATION', 'BROWSER_AUTOMATION', 'FILE_SYSTEM', 'AUDIT_LOG_READER', 'STATIC_ANALYSIS']),
        priorityWeight: 1.5
      }
    ];

    return new AgentRegistry(defaultAgents);
  }
}
