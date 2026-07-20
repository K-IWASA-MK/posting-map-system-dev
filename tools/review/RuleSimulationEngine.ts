import * as path from 'path';
import { RuleCandidate } from './RuleCandidate';

export class RuleSimulationEngine {
  /**
   * Tests the candidate rule against historic plan data to discover False Positives.
   * If the rule flags an approved historic plan, it fails validation.
   */
  public static simulate(candidate: RuleCandidate, historyRecords: any[]): { pass: boolean; falsePositiveCount: number } {
    console.log(`[RuleSimulationEngine] Simulating candidate "${candidate.id}" over ${historyRecords.length} historical logs...`);
    
    let falsePositives = 0;
    const workspaceRoot = path.resolve(__dirname, '../..');

    for (const record of historyRecords) {
      // Only evaluate on historic plans that were successfully approved (PROCEED)
      if (record.decision !== 'PROCEED') {
        continue;
      }

      let triggeredMatch = false;
      const proposedFiles = record.proposedFiles || [];

      for (const file of proposedFiles) {
        const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');
        const isAtRoot = !relativePath.includes('/');
        const ext = path.extname(file);

        let conditionsSatisfied = true;

        for (const cond of candidate.triggerConditions) {
          let matchedCondition = false;

          if (cond.startsWith('path-starts:')) {
            const prefix = cond.substring(12);
            if (relativePath.startsWith(prefix)) {
              matchedCondition = true;
            }
          } else if (cond.startsWith('root-file:')) {
            const glob = cond.substring(10);
            if (isAtRoot) {
              if (glob === '*' || (glob.startsWith('*.') && ext === glob.substring(1))) {
                matchedCondition = true;
              } else if (relativePath === glob) {
                matchedCondition = true;
              }
            }
          } else if (cond === 'project-escape') {
            if (!relativePath.startsWith('projects/') && !relativePath.startsWith('sdk/') && !relativePath.startsWith('kernel/') && !relativePath.startsWith('tools/')) {
              matchedCondition = true;
            }
          }

          if (!matchedCondition) {
            conditionsSatisfied = false;
            break;
          }
        }

        if (conditionsSatisfied && candidate.triggerConditions.length > 0) {
          triggeredMatch = true;
          break;
        }
      }

      if (triggeredMatch) {
        console.warn(`  [False Positive Alert] Approved historical plan "${record.taskTitle}" would be REJECTED by candidate rule "${candidate.id}"!`);
        falsePositives++;
      }
    }

    const pass = falsePositives === 0;
    console.log(`[RuleSimulationEngine] Simulation finished. False Positives: ${falsePositives}. Result: ${pass ? 'PASS' : 'FAIL'}`);

    return {
      pass,
      falsePositiveCount: falsePositives
    };
  }
}
