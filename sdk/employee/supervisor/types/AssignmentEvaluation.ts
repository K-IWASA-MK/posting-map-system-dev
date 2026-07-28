/**
 * AssignmentEvaluation.ts
 * 
 * Multi-dimensional Evaluation Result for Worker Assignment
 */

export interface AssignmentEvaluation {
  matchScore: number;       // 0.0 to 1.0 (capability match)
  permissionScore: number;  // 0.0 to 1.0 (governance permissions match)
  availabilityScore: number;// 0.0 to 1.0 (current load & status)
  compositeScore: number;   // Combined score
  reason: string;           // Descriptive justification
}
