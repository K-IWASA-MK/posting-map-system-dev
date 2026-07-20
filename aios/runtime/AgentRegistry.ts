import { ExecutionRequest } from './ExecutionRequest';
import { ResolvedAgent } from './ResolvedAgent';
import { AgentDefinition } from './AgentDefinition';

export class AgentRegistry {
  private static readonly registry: ReadonlyMap<string, AgentDefinition> = new Map<string, AgentDefinition>([
    ["agent-architecture", {
      agentId: "agent-architecture",
      role: "Architect",
      promptProfile: "System Architecture agent focused on microkernel boundaries and design logic.",
      capabilities: [
        { capabilityId: "CAP-RESOLVE-ARCH", description: "Enables code design review and boundary assertions.", version: "1.0.0" }
      ],
      allowedTools: ["read_file", "write_file", "git"]
    }],
    ["agent-uiux", {
      agentId: "agent-uiux",
      role: "UIUX Designer",
      promptProfile: "UI UX Design expert prioritizing clean glassmorphism, readability, and mobile targets.",
      capabilities: [
        { capabilityId: "CAP-DESIGN-UI", description: "Enables design system compliance reviews.", version: "1.0.0" }
      ],
      allowedTools: ["read_file", "write_file", "generate_image"]
    }],
    ["agent-security", {
      agentId: "agent-security",
      role: "Security Officer",
      promptProfile: "Security compliance auditor checking for leakage, direct API calls, and privilege rules.",
      capabilities: [
        { capabilityId: "CAP-AUDIT-SEC", description: "Enables security boundary checks.", version: "1.0.0" }
      ],
      allowedTools: ["read_file"]
    }],
    ["agent-qa", {
      agentId: "agent-qa",
      role: "Quality Assurance",
      promptProfile: "QA and integration validation agent verifying compilation and simulation tests.",
      capabilities: [
        { capabilityId: "CAP-RUN-TEST", description: "Enables platform compilation and suite runs.", version: "1.0.0" }
      ],
      allowedTools: ["read_file", "execute_command"]
    }]
  ]);

  /**
   * Resolves target agent definition from ExecutionRequest.
   * Throws an error if the agent is unknown or request is invalid.
   */
  public static resolve(request: ExecutionRequest): ResolvedAgent {
    if (!request || !request.agentId) {
      throw new Error("AgentRegistry: ExecutionRequest contains empty or invalid agentId.");
    }

    const definition = this.registry.get(request.agentId);
    if (!definition) {
      throw new Error(`AgentRegistry: Agent ID "${request.agentId}" is not registered.`);
    }

    return {
      agentId: definition.agentId,
      role: definition.role,
      promptProfile: definition.promptProfile,
      capabilities: definition.capabilities,
      allowedTools: definition.allowedTools
    };
  }

  /**
   * Lists all statically registered agent definitions.
   */
  public static list(): readonly AgentDefinition[] {
    return Array.from(this.registry.values());
  }
}
