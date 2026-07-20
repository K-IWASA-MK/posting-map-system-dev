import { AgentReviewResult } from './AgentReviewResult';

export interface ConsensusStrategy {
  readonly id: string;
  evaluate(agentReviews: AgentReviewResult[]): {
    status: 'PASS' | 'FAILED';
    decision: 'PROCEED' | 'REJECT';
    score: number;
    trace: string[];
  };
}

export class StrictConsensusStrategy implements ConsensusStrategy {
  public readonly id = 'strict-consensus';

  public evaluate(agentReviews: AgentReviewResult[]): {
    status: 'PASS' | 'FAILED';
    decision: 'PROCEED' | 'REJECT';
    score: number;
    trace: string[];
  } {
    const trace: string[] = ['[Consensus Strategy: Strict] Evaluating agent votes...'];
    let decision: 'PROCEED' | 'REJECT' = 'PROCEED';
    let status: 'PASS' | 'FAILED' = 'PASS';
    let totalScore = 0;

    for (const r of agentReviews) {
      totalScore += r.score;
      trace.push(`  - Agent [${r.agentId}] (${r.role}) returned score ${r.score} (Decision: ${r.decision})`);

      // 1. Check for Security VETO (Hard Block)
      if (r.decision === 'VETO') {
        decision = 'REJECT';
        status = 'FAILED';
        trace.push(`  [VETO TRIGGERED] Security veto detected in agent [${r.agentId}]. Consensus REJECTED.`);
      }

      // 2. Check for critical errors in ARCHITECTURE or GOVERNANCE
      if ((r.role === 'ARCHITECTURE' || r.role === 'GOVERNANCE') && r.decision === 'FAILED') {
        decision = 'REJECT';
        status = 'FAILED';
        trace.push(`  [CORE BLOCKER] Blocker detected in core agent [${r.agentId}] (${r.role}). Consensus REJECTED.`);
      }

      // 3. Performance or Quality warning
      if ((r.role === 'PERFORMANCE' || r.role === 'QUALITY') && (r.decision === 'WARNING' || r.decision === 'FAILED')) {
        trace.push(`  [WARNING LOG] Non-blocking warning detected in agent [${r.agentId}] (${r.role}).`);
      }
    }

    const averageScore = Math.round(totalScore / agentReviews.length);
    trace.push(`  - Calculated average score: ${averageScore}/100`);

    // 4. Threshold check
    if (averageScore < 80 && decision === 'PROCEED') {
      decision = 'REJECT';
      status = 'FAILED';
      trace.push(`  [SCORE BLOCKER] Average score ${averageScore} is below threshold 80. Consensus REJECTED.`);
    }

    trace.push(`[Consensus Strategy: Strict] Evaluation complete. Verdict: ${decision} (${status})`);

    return {
      status,
      decision,
      score: averageScore,
      trace
    };
  }
}
