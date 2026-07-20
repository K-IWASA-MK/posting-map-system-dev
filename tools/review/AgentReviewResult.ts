import { ReviewViolation } from './ReviewResult';
import { ReviewRole } from './ReviewRole';

export interface AgentReviewResult {
  readonly agentId: string;
  readonly role: ReviewRole;
  readonly decision: 'PASS' | 'WARNING' | 'FAILED' | 'VETO';
  readonly score: number; // Score from 0 to 100 evaluated by this agent
  readonly violations: ReviewViolation[];
  readonly recommendations: string[];
}
