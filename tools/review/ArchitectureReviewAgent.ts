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

    // 4. Discover and evaluate rules
    ReviewRuleRegistry.discover();
    const rules = ReviewRuleRegistry.getRules();
    const violations: ReviewViolation[] = [];

    for (const rule of rules) {
      const ruleViolations = await rule.evaluate(context);
      violations.push(...ruleViolations);
    }

    // 5. Calculate score (base 100, -20 per error, -5 per warning)
    let score = 100;
    for (const v of violations) {
      if (v.severity === 'ERROR') {
        score -= 20;
      } else {
        score -= 5;
      }
    }
    score = Math.max(0, score);

    // 6. Determine Decision
    const hasErrors = violations.some(v => v.severity === 'ERROR');
    const decision = (hasErrors || score < 80) ? 'REJECT' : 'PROCEED';
    const status = decision === 'PROCEED' ? 'PASS' : 'FAILED';
    const timestamp = new Date().toISOString();

    const result: ReviewResult = {
      status,
      decision,
      score,
      violations,
      timestamp
    };

    // 7. Write AUDIT_REVIEW_RESULT.json (root of project)
    const workspaceRoot = path.resolve(__dirname, '../..');
    const jsonPath = path.join(workspaceRoot, 'AUDIT_REVIEW_RESULT.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`[Architecture Review Agent] Written JSON result to: ${jsonPath}`);

    // 8. Generate Human-Readable Markdown Report
    const reportPath = path.join(workspaceRoot, 'ArchitectureReviewReport.md');
    const reportMd = this.generateReportMarkdown(result, context);
    fs.writeFileSync(reportPath, reportMd, 'utf-8');
    console.log(`[Architecture Review Agent] Written human-readable report to: ${reportPath}`);

    return result;
  }

  private static generateReportMarkdown(result: ReviewResult, context: ReviewContext): string {
    const statusEmoji = result.decision === 'PROCEED' ? '✅ PASS' : '❌ REJECT';
    
    let md = `# Architecture Review Report

## Summary
* **Status**: ${result.status}
* **Score**: ${result.score} / 100
* **Decision**: ${statusEmoji}
* **Timestamp**: ${result.timestamp}

## Context
* **Task Title**: ${context.taskTitle}
* **Is Platform Task**: ${context.isPlatformTask ? 'Yes' : 'No'}
* **Files Inspected**: ${context.proposedFiles.length}

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
      md += `* Architecture is compliant. You are authorized to proceed to implementation.\n`;
    } else {
      md += `* Please resolve all **ERROR** violations listed above. Check target path directories and file ownership boundaries before re-running the review agent.\n`;
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
