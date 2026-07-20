import * as fs from 'fs';
import * as path from 'path';
import { ConstitutionRegistry } from './ConstitutionRegistry';
import { ConstitutionViolation } from './ConstitutionViolation';

export class ConstitutionComplianceEngine {
  /**
   * Evaluates targets against the supreme AIOS Constitution Articles.
   */
  public static evaluate(
    targetType: 'PLAN' | 'RULE' | 'CONSENSUS',
    targetData: any
  ): ConstitutionViolation[] {
    const violations: ConstitutionViolation[] = [];
    const articles = ConstitutionRegistry.getArticles();

    if (targetType === 'PLAN') {
      const planContent = (targetData.planContent || '').toLowerCase();

      // C-003: No Secret Exposure
      const hasSecret = 
        planContent.includes('password') || 
        planContent.includes('secret_key') || 
        planContent.includes('api_key') || 
        planContent.includes('private_key');

      if (hasSecret) {
        const art = articles.find(a => a.id === 'C-003')!;
        violations.push({
          articleId: art.id,
          message: `Constitution Violation C-003 (Secret Exposure): Implementation plan contains plain-text credentials or API key keywords.`,
          severity: art.severity
        });
      }

      // C-008: Explainable Decision (Check basic quality / description brevity)
      if (planContent.length < 100) {
        const art = articles.find(a => a.id === 'C-008')!;
        violations.push({
          articleId: art.id,
          message: `Constitution Quality Alert C-008: Plan is too brief (length: ${planContent.length} chars). Detail recommendations require context.`,
          severity: art.severity
        });
      }

      // C-001 & C-002: Project Boundary check on files
      const proposedFiles = targetData.proposedFiles || [];
      const workspaceRoot = path.resolve(__dirname, '../..');
      
      for (const file of proposedFiles) {
        const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');
        
        // If not in projects/ and is application task
        if (!targetData.isPlatformTask) {
          if (!relativePath.startsWith('projects/') && !relativePath.startsWith('tools/') && !relativePath.startsWith('sdk/')) {
            const art = articles.find(a => a.id === 'C-001')!;
            violations.push({
              articleId: art.id,
              message: `Constitution Violation C-001 (Boundary Escape): Application changes target root workspace resource "${relativePath}".`,
              severity: art.severity
            });
          }
        }
      }

      // C-011 & C-012: Centralized path resolution checks
      const fs = require('fs');
      const { RootResolutionPolicy } = require('./RootResolutionPolicy');
      
      const planViolation = RootResolutionPolicy.isPolicyViolated(targetData.planContent || '');
      if (planViolation.violated) {
        const art12 = articles.find(a => a.id === 'C-012')!;
        violations.push({
          articleId: art12.id,
          message: `Constitution Violation C-012: Plan content uses parent traversal path patterns.`,
          severity: art12.severity
        });
      }

      for (const file of proposedFiles) {
        if (fs.existsSync(file)) {
          try {
            const content = fs.readFileSync(file, 'utf-8');
            const fileViolation = RootResolutionPolicy.isPolicyViolated(content);
            if (fileViolation.violated) {
              const art11 = articles.find(a => a.id === 'C-011')!;
              const art12 = articles.find(a => a.id === 'C-012')!;
              violations.push({
                articleId: art11.id,
                message: `Constitution Violation C-011: File "${file}" performs self-discovery of project roots instead of using RootResolver.`,
                severity: art11.severity
              });
              violations.push({
                articleId: art12.id,
                message: `Constitution Violation C-012: File "${file}" uses forbidden relative directory traversal methods: ${fileViolation.reason}`,
                severity: art12.severity
              });
            }
          } catch (e) {
            // Ignore un-readable files
          }
        }
      }
    }

    if (targetType === 'RULE') {
      // C-004: Deterministic behavior (dynamic rule conditions checking)
      const triggerConditions = targetData.triggerConditions || [];
      const hasRandom = triggerConditions.some((c: string) => c.includes('random') || c.includes('percent'));
      if (hasRandom) {
        const art = articles.find(a => a.id === 'C-004')!;
        violations.push({
          articleId: art.id,
          message: `Constitution Violation C-004 (Non-Deterministic Rule): Dynamic rule "${targetData.id}" contains non-deterministic triggers.`,
          severity: art.severity
        });
      }

      // C-007: Foundation First (Verify candidate rule has metadata provenance origins)
      if (!targetData.derivedFrom || targetData.derivedFrom.length === 0) {
        const art = articles.find(a => a.id === 'C-007')!;
        violations.push({
          articleId: art.id,
          message: `Constitution Violation C-007 (No Provenance): Evolving rule candidate "${targetData.id}" lacks references to derived knowledge or patterns.`,
          severity: art.severity
        });
      }
    }

    if (targetType === 'CONSENSUS') {
      // C-008: Explainable Decision (Consensus traces validation)
      if (!targetData.consensusTrace || targetData.consensusTrace.length === 0) {
        const art = articles.find(a => a.id === 'C-008')!;
        violations.push({
          articleId: art.id,
          message: `Constitution Quality Alert C-008: Consensus result lacks explainable trace logs.`,
          severity: art.severity
        });
      }
    }

    return violations;
  }

  /**
   * Performs the validation flow and outputs trace logs and scores.
   */
  public static validate(
    targetType: 'PLAN' | 'RULE' | 'CONSENSUS',
    targetData: any
  ): {
    pass: boolean;
    decision: 'PROCEED' | 'REJECT';
    score: number;
    violations: ConstitutionViolation[];
    trace: string[];
  } {
    console.log(`[Constitution Compliance Engine] Starting validation for type: "${targetType}"`);
    
    const trace: string[] = [`[Constitution Compliance Registry: v${ConstitutionRegistry.version}] Commencing audit...`];
    const violations = this.evaluate(targetType, targetData);

    let score = 100;
    let hasBlocker = false;

    // Evaluate penalty points
    for (const v of violations) {
      trace.push(`  - [VIOLATION] [${v.articleId}] (${v.severity}) ${v.message}`);
      if (v.severity === 'VETO') {
        score -= 50;
        hasBlocker = true;
      } else if (v.severity === 'ERROR') {
        score -= 20;
        hasBlocker = true;
      } else {
        score -= 5;
      }
    }

    score = Math.max(0, score);
    const pass = !hasBlocker && score >= 80;
    const decision = pass ? 'PROCEED' : 'REJECT';

    trace.push(`[Constitution Compliance verdict] Score: ${score}/100. Verdict: ${decision}`);

    return {
      pass,
      decision,
      score,
      violations,
      trace
    };
  }

  /**
   * Generates a markdown ConstitutionReport.md in the workspace root.
   */
  public static writeReport(
    validationResult: ReturnType<typeof ConstitutionComplianceEngine.validate>,
    targetType: string,
    targetName: string
  ): void {
    const statusEmoji = validationResult.decision === 'PROCEED' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT';
    const workspaceRoot = path.resolve(__dirname, '../..');
    const reportPath = path.join(workspaceRoot, 'ConstitutionReport.md');

    let md = `# AIOS Constitution Compliance Report

## Executive Summary
* **Status**: ${statusEmoji}
* **Compliance Score**: ${validationResult.score}%
* **Verdict**: ${validationResult.decision}
* **Target Audited**: \`${targetName}\` (${targetType})
* **Registry Version**: v${ConstitutionRegistry.version} (Effective: ${ConstitutionRegistry.effectiveDate})

## Compliance Audit Log
\`\`\`text
`;

    for (const line of validationResult.trace) {
      md += `${line}\n`;
    }

    md += `\`\`\`

## Articles Compliance Status
| Article ID | Title | Category | Severity | Status |
| :--- | :--- | :--- | :--- | :--- |
`;

    const articles = ConstitutionRegistry.getArticles();
    for (const a of articles) {
      const violated = validationResult.violations.some(v => v.articleId === a.id);
      let status = '🟩 PASS';
      if (violated) {
        status = a.severity === 'WARNING' ? '🟨 WARNING' : '🟥 FAIL';
      }
      md += `| \`${a.id}\` | ${a.title} | **${a.category}** | ${a.severity} | ${status} |\n`;
    }

    fs.writeFileSync(reportPath, md, 'utf-8');
    console.log(`[Constitution Compliance Engine] Written compliance report to: ${reportPath}`);
  }
}
