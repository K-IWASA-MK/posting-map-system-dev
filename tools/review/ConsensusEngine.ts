import { ReviewContext } from './ReviewRule';
import { ReviewAgent, ArchitectureAgent, GovernanceAgent, SecurityAgent, PerformanceAgent, QualityAgent } from './ReviewAgent';
import { AgentReviewResult } from './AgentReviewResult';
import { ConsensusStrategy, StrictConsensusStrategy } from './ConsensusStrategy';
import { ReviewResult } from './ReviewResult';

export class ConsensusEngine {
  private readonly agents: ReviewAgent[] = [];

  constructor() {
    // Standard AI review panel registration
    this.agents.push(new ArchitectureAgent());
    this.agents.push(new GovernanceAgent());
    this.agents.push(new SecurityAgent());
    this.agents.push(new PerformanceAgent());
    this.agents.push(new QualityAgent());
  }

  /**
   * Runs the consensus review flow across all registered agents and applies the strategy.
   */
  public async run(
    context: ReviewContext,
    strategy: ConsensusStrategy = new StrictConsensusStrategy()
  ): Promise<{
    result: ReviewResult;
    trace: string[];
    agentResults: AgentReviewResult[];
  }> {
    console.log(`[Consensus Engine] Commencing review panel evaluation using strategy: "${strategy.id}"`);
    
    const agentResults: AgentReviewResult[] = [];
    for (const agent of this.agents) {
      console.log(`  - Invoking agent: "${agent.id}" (${agent.role}) [Capabilities: ${agent.capabilities.join(', ')}]`);
      const res = await agent.review(context);
      agentResults.push(res);
    }

    const evaluation = strategy.evaluate(agentResults);

    // Merge violations from all agents
    const allViolations = agentResults.flatMap(r => r.violations);

    const result: ReviewResult = {
      status: evaluation.status,
      decision: evaluation.decision,
      score: evaluation.score,
      violations: allViolations,
      timestamp: new Date().toISOString()
    };

    return {
      result,
      trace: evaluation.trace,
      agentResults
    };
  }
}
