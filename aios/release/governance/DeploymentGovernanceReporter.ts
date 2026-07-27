/**
 * DeploymentGovernanceReporter.ts
 * 
 * Deployment Target Verification Gate - Governance Reporter (Sprint DTVG-12)
 * Governance Agent のパイプライン全体結果（Gate成績、Risk、Decision、Confidence、推論）を
 * 統合 Markdown ガバナンスレポートとして整形・出力する。
 */

import { GovernanceReport } from './DeploymentGovernanceAgentTypes';

export class DeploymentGovernanceReporter {
  /**
   * GovernanceReport オブジェクトから最終提出用 Markdown レポート文を構築する
   */
  public static generateReportMarkdown(report: GovernanceReport): string {
    const lines: string[] = [];

    const badge = report.overallDecision === 'ALLOW' ? '✅ ALLOW (デプロイ承認)' :
                  report.overallDecision === 'REQUIRE_REVIEW' ? '⚠️ REQUIRE_REVIEW (要CEO承認)' :
                  '🚫 DENY (デプロイ拒否・停止推奨)';

    lines.push(`# 🛡️ AI Employee Deployment Governance Report`);
    lines.push(`**Agent**: \`DeploymentGovernanceAgent\``);
    lines.push(`**Release ID**: \`${report.releaseId}\``);
    lines.push(`**Target Employee**: \`${report.employeeId}\``);
    lines.push(`**Governance Decision**: ${badge}`);
    lines.push(`**Decision Confidence**: **${report.confidence}%**`);
    lines.push(`**Assessed Risk Level**: **${report.riskLevel}**`);
    lines.push(`**Generated At**: ${report.generatedAt}\n`);

    lines.push(`## 📊 Gate Check Summary`);
    lines.push(`- **Total Gates Assessed**: ${report.gateSummary.totalGates}`);
    lines.push(`- **Passed Gates**: ${report.gateSummary.passedGates}`);
    lines.push(`- **Failed Gates**: ${report.gateSummary.failedGates}\n`);

    lines.push(`## 🔄 Execution Stage Pipeline Results`);
    for (const stage of report.stageResults) {
      const sBadge = stage.status === 'PASS' ? '✅ PASS' : stage.status === 'WARNING' ? '⚠️ WARNING' : '❌ FAIL';
      lines.push(`- **[${stage.stage}]**: ${sBadge} (${stage.durationMs}ms) - ${stage.detail}`);
    }
    lines.push(``);

    lines.push(`## 🤖 Decision & Explanation`);
    lines.push(report.decisionReport.explanationMarkdown);
    lines.push(``);

    lines.push(`## 💡 Autonomous Preventive Recommendations`);
    lines.push(`**Risk Summary**: ${report.recommendation.riskPrediction.reason}`);
    for (const sug of report.recommendation.suggestions) {
      lines.push(`- **${sug.title}** (Category: \`${sug.category}\`, Confidence: ${sug.confidence})`);
      for (const act of sug.preventiveActions) {
        lines.push(`  * Action: ${act.title} - ${act.description} (Requires Approval: ${act.requiresApproval})`);
      }
    }

    return lines.join('\n');
  }
}
