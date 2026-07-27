/**
 * DeploymentDecisionExplainer.ts
 * 
 * Deployment Target Verification Gate - Decision Explainer (Sprint DTVG-11)
 * デプロイ評価決定の判定理由・リスク根拠・過去事故比較・推奨アクションを
 * 人間および AI Employee 向けに分かりやすく説明する Markdown レポートを生成する。
 */

import {
  ApprovalDecision,
  ApprovalReason,
  EvidenceReference,
  DecisionReport
} from './DeploymentApprovalTypes';

export class DeploymentDecisionExplainer {
  /**
   * 構造化評価データから解説文 (explanationMarkdown) を構築する
   */
  public static generateExplanation(
    releaseId: string,
    decision: ApprovalDecision,
    confidence: number,
    reasons: ApprovalReason[],
    evidences: EvidenceReference[]
  ): string {
    const lines: string[] = [];

    const badge = decision === 'ALLOW' ? '✅ ALLOW (デプロイ許可)' :
                  decision === 'REQUIRE_REVIEW' ? '⚠️ REQUIRE_REVIEW (要事前承認)' :
                  '🚫 DENY (デプロイ停止推奨)';

    lines.push(`### 🤖 AI Employee Deployment Assessment Report`);
    lines.push(`**Release ID**: \`${releaseId}\``);
    lines.push(`**Evaluation Decision**: ${badge}`);
    lines.push(`**Assessment Confidence**: **${confidence}%**\n`);

    lines.push(`#### 📌 Key Decision Reasons (判断理由)`);
    if (reasons.length === 0) {
      lines.push(`- No critical risk factors identified. Satisfies baseline deployment requirements.`);
    } else {
      for (const r of reasons) {
        lines.push(`- [${r.category}] ${r.statement} (Weight: ${r.weight}/100)`);
      }
    }

    lines.push(`\n#### 🔍 Audit Evidence References (根拠エビデンス)`);
    if (evidences.length === 0) {
      lines.push(`- Verification passed all predefined gate checks.`);
    } else {
      for (const e of evidences) {
        lines.push(`- **[${e.source}]** \`${e.gateOrPatternId}\`: ${e.detail}`);
      }
    }

    lines.push(`\n#### 💡 Action Guidance (推奨アクション)`);
    if (decision === 'ALLOW') {
      lines.push(`- Release approval granted. Safe to proceed with production deployment execution.`);
    } else if (decision === 'REQUIRE_REVIEW') {
      lines.push(`- High risk or configuration discrepancy detected. CEO / Lead Developer review required before deployment.`);
    } else {
      lines.push(`- Critical governance or fingerprint violation detected. Deployment must be blocked and corrected.`);
    }

    return lines.join('\n');
  }
}
