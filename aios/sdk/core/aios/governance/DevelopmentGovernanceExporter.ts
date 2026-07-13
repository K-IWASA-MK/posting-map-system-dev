import { DevelopmentGovernanceResult } from './DevelopmentGovernanceResult';

export class DevelopmentGovernanceExporter {
  public static toConsole(result: DevelopmentGovernanceResult): void {
    const { decision } = result;
    console.log(`\n=== Development Governance Decision ===`);
    console.log(`Decision ID: ${decision.decisionId} (v${decision.decisionVersion})`);
    console.log(`Status:      ${decision.status}`);
    console.log(`Action:      ${decision.action}`);
    console.log(`Score:       ${decision.score}`);
    console.log(`Confidence:  ${decision.confidence} (${decision.confidenceSource})`);
    console.log(`Reason:      ${decision.reason}`);
    console.log(`---------------------------------------`);
    
    if (decision.recommendations.length > 0) {
      console.log(`Recommendations:`);
      decision.recommendations.forEach(r => {
        console.log(`  [${r.priority}] ${r.description}`);
      });
    } else {
      console.log(`Recommendations: None`);
    }
    console.log(`=======================================\n`);
  }

  public static toJson(result: DevelopmentGovernanceResult): string {
    return JSON.stringify(result, null, 2);
  }
}
