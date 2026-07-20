import * as fs from 'fs';
import * as path from 'path';
import { ReviewRuleRegistry } from './ReviewRuleRegistry';
import { ReviewContext } from './ReviewRule';
import { ReviewResult, ReviewViolation } from './ReviewResult';

export class ArchitectureReviewAgent {
  public static async run(planPath: string): Promise<ReviewResult> {
    console.log(`[Architecture Review Agent] Loading plan from: ${planPath}`);

    if (!fs.existsSync(planPath)) {
      throw new Error(`Implementation plan file not found at: ${planPath}`);
    }

    const planContent = fs.readFileSync(planPath, 'utf-8');

    // 1. Parse Task Title (first header line starting with #)
    let taskTitle = 'Untitled Task';
    const headerMatch = planContent.match(/^#\s+(.+)$/m);
    if (headerMatch) {
      taskTitle = headerMatch[1].trim();
    }

    // 2. Parse proposed file links (e.g. [file.ts](file:///path/to/file.ts))
    const proposedFiles: string[] = [];
    const fileLinkRegex = /\[.*?\]\((file:\/\/([^\)]+))\)/g;
    let match;
    while ((match = fileLinkRegex.exec(planContent)) !== null) {
      const decodedPath = decodeURIComponent(match[2]);
      proposedFiles.push(path.resolve(decodedPath));
    }

    // Deduplicate proposed files
    const uniqueFiles = Array.from(new Set(proposedFiles));

    // 3. Determine if it is a platform task (ASP-*, G6-*, or title contains AIOS)
    const isPlatformTask = 
      taskTitle.toLowerCase().includes('aios') || 
      taskTitle.toLowerCase().includes('asp-') || 
      taskTitle.toLowerCase().includes('g6-');

    const context: ReviewContext = {
      taskTitle,
      isPlatformTask,
      proposedFiles: uniqueFiles,
      planContent
    };

    console.log(`[Architecture Review Agent] Discovered ${uniqueFiles.length} files to inspect.`);
    console.log(`[Architecture Review Agent] Task Owner Context: ${isPlatformTask ? 'AIOS Core Platform' : 'Application'}`);

    // 4. Run Consensus Engine across AI review panel
    const { ConsensusEngine } = require('./ConsensusEngine');
    const engine = new ConsensusEngine();
    const { result, trace, agentResults } = await engine.run(context);

    // 5. Run Constitution Compliance Engine over the Plan and Consensus
    const { ConstitutionComplianceEngine } = require('./ConstitutionComplianceEngine');
    const compliance = ConstitutionComplianceEngine.validate('PLAN', context);
    
    // Also validate consensus decisions to verify C-008 Explainable Decision
    const consensusCompliance = ConstitutionComplianceEngine.validate('CONSENSUS', {
      consensusTrace: trace
    });

    // Merge violations and veto checks
    const finalViolations = [...result.violations];
    
    for (const cv of compliance.violations) {
      finalViolations.push({
        ruleId: `CONSTITUTION-${cv.articleId}`,
        severity: cv.severity === 'VETO' ? 'ERROR' : (cv.severity === 'ERROR' ? 'ERROR' : 'WARNING'),
        message: cv.message,
        remediation: `Constitution Requirement for article ${cv.articleId}`
      });
    }

    for (const cv of consensusCompliance.violations) {
      finalViolations.push({
        ruleId: `CONSTITUTION-${cv.articleId}`,
        severity: cv.severity === 'VETO' ? 'ERROR' : (cv.severity === 'ERROR' ? 'ERROR' : 'WARNING'),
        message: cv.message,
        remediation: `Constitution Requirement for article ${cv.articleId}`
      });
    }

    const hasConstitutionBlocker = !compliance.pass || !consensusCompliance.pass;
    const finalDecision: 'PROCEED' | 'REJECT' = (result.decision === 'REJECT' || hasConstitutionBlocker) ? 'REJECT' : 'PROCEED';
    const finalStatus: 'PASS' | 'FAILED' = finalDecision === 'PROCEED' ? 'PASS' : 'FAILED';
    const finalScore = Math.min(result.score, compliance.score, consensusCompliance.score);

    // Write the constitution report to ConstitutionReport.md
    const combinedCompliance = {
      pass: !hasConstitutionBlocker,
      decision: finalDecision,
      score: finalScore,
      violations: [...compliance.violations, ...consensusCompliance.violations],
      trace: [...compliance.trace, ...consensusCompliance.trace]
    };
    ConstitutionComplianceEngine.writeReport(combinedCompliance, 'PLAN', context.taskTitle);

    // Attach trace and agent reviews to serialized JSON
    const finalResult = {
      status: finalStatus,
      decision: finalDecision,
      score: finalScore,
      violations: finalViolations,
      timestamp: new Date().toISOString(),
      consensusTrace: trace,
      agentReviews: agentResults,
      constitutionTrace: combinedCompliance.trace
    };

    // 6. Write AUDIT_REVIEW_RESULT.json (root of project)
    const workspaceRoot = path.resolve(__dirname, '../..');
    const jsonPath = path.join(workspaceRoot, 'AUDIT_REVIEW_RESULT.json');
    fs.writeFileSync(jsonPath, JSON.stringify(finalResult, null, 2), 'utf-8');
    console.log(`[Architecture Review Agent] Written JSON result to: ${jsonPath}`);

    // 7. Generate Human-Readable Markdown Report
    const reportPath = path.join(workspaceRoot, 'ArchitectureReviewReport.md');
    const reportMd = this.generateReportMarkdown(finalResult, context);
    fs.writeFileSync(reportPath, reportMd, 'utf-8');
    console.log(`[Architecture Review Agent] Written human-readable report to: ${reportPath}`);

    return finalResult;
  }

  private static generateReportMarkdown(result: any, context: ReviewContext): string {
    const statusEmoji = result.decision === 'PROCEED' ? '✅ PASS' : '❌ REJECT';
    
    let md = `# Architecture Review Report (Consensus Board)

## Summary
* **Status**: ${result.status}
* **Score**: ${result.score} / 100
* **Decision**: ${statusEmoji}
* **Timestamp**: ${result.timestamp}

## Context
* **Task Title**: ${context.taskTitle}
* **Is Platform Task**: ${context.isPlatformTask ? 'Yes' : 'No'}
* **Files Inspected**: ${context.proposedFiles.length}

## AI Consensus Board
| AI Agent | Role | Score | Decision | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
`;

    if (result.agentReviews) {
      for (const ar of result.agentReviews) {
        const caps = ar.agentId === 'agent-architecture' ? 'Boundary, Ownership, Pattern, Knowledge' :
                     ar.agentId === 'agent-governance' ? 'Responsibility, Policy' :
                     ar.agentId === 'agent-security' ? 'Secret, Sandbox, Trust' :
                     ar.agentId === 'agent-performance' ? 'Runtime, Complexity, Cost' :
                     'Score, Maintainability, Readability';
        md += `| \`${ar.agentId}\` | **${ar.role}** | ${ar.score} | ${ar.decision} | ${caps} |\n`;
      }
    }

    md += `\n## Consensus Trace
\`\`\`text
`;

    if (result.consensusTrace) {
      for (const t of result.consensusTrace) {
        md += `${t}\n`;
      }
    }

    md += `\`\`\`

## Violations (${result.violations.length})
`;

    if (result.violations.length === 0) {
      md += `* No architectural violations detected. Complete compliance verified.\n`;
    } else {
      for (const v of result.violations) {
        const severityBadge = v.severity === 'ERROR' ? '🚨 ERROR' : '⚠️ WARNING';
        const fileLink = v.targetFile ? `[${path.basename(v.targetFile)}](file://${v.targetFile})` : 'N/A';
        md += `\n### [${v.ruleId}] ${severityBadge}\n`;
        md += `* **File**: ${fileLink}\n`;
        md += `* **Message**: ${v.message}\n`;
        if (v.remediation) {
          md += `* **Remediation**: ${v.remediation}\n`;
        }
      }
    }

    md += `\n## Recommendations\n`;
    if (result.decision === 'PROCEED') {
      md += `* Consensus board is compliant. You are authorized to proceed to implementation.\n`;
    } else {
      md += `* Please resolve all **ERROR** violations and security vetoes listed above before re-running the review agent.\n`;
    }

    return md;
  }
}

// Direct execution from CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  // Default to standard implementation plan path in brain artifacts
  const defaultPlanPath = path.resolve(__dirname, '../../../../.gemini/antigravity-ide/brain/b0c37b51-e628-4cdd-be7d-66a6504650d8/implementation_plan.md');
  const planPath = args[0] || defaultPlanPath;

  ArchitectureReviewAgent.run(planPath)
    .then((result) => {
      console.log(`[Architecture Review Agent] Verdict: ${result.decision} (Score: ${result.score}/100)`);
      if (result.decision === 'REJECT') {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[Architecture Review Agent] Fatal error: ${err.message}`);
      process.exit(1);
    });
}
