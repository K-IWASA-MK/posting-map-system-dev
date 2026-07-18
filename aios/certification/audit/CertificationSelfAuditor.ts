import * as fs from "fs";
import * as path from "path";

export class CertificationSelfAuditor {
  private readonly certDir: string;

  constructor(certDir?: string) {
    this.certDir = certDir || path.join(__dirname, "..");
  }

  /**
   * Safe self-audit evaluation.
   */
  public audit(): { success: boolean; score: number; findings: string[] } {
    const findings: string[] = [];
    let violationCount = 0;

    if (!fs.existsSync(this.certDir)) {
      findings.push("Self Audit Error: Certification directory does not exist.");
      return { success: false, score: 0, findings };
    }

    const files = this.getTsFiles(this.certDir);

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const baseName = path.basename(file);

      // 1. Direct Import check
      // Ensure certification code does not directly import execution/validation runtime logic
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("import ") && line.includes("from ")) {
          const match = line.match(/from\s+["']([^"']+)["']/);
          if (match) {
            const importPath = match[1];
            if (importPath.startsWith(".")) {
              const resolvedPath = path.resolve(path.dirname(file), importPath);
              // Check if it goes outside the certification directory root
              if (!resolvedPath.startsWith(this.certDir)) {
                // If it imports from execution, validation, release, or autonomous
                if (
                  resolvedPath.includes("/execution") ||
                  resolvedPath.includes("/validation") ||
                  resolvedPath.includes("/release") ||
                  resolvedPath.includes("/autonomous")
                ) {
                  findings.push(
                    `Self-Audit Violation: ${baseName}:${i + 1} imports forbidden external runtime code via '${importPath}'`
                  );
                  violationCount++;
                }
              }
            }
          }
        }
      }

      // 2. Tampering & Bypass detection (Split strings to prevent self-flagging)
      const bypassWord1 = "BYPASS";
      const bypassWord2 = "AUDIT";
      const bypassFlag = bypassWord1 + "_" + bypassWord2;
      const bypassExpression = "bypass" + "Audit = true";

      // Count occurrences of bypass flag in content, excluding the auditor itself
      if (baseName !== "CertificationSelfAuditor.ts") {
        if (content.includes(bypassFlag) || content.includes(bypassExpression)) {
          findings.push(`Self-Audit Violation: bypass flag detected in ${baseName}`);
          violationCount++;
        }
      }

      // 3. Freeze Controller integrity check
      if (baseName === "GenerationFreezeController.ts") {
        if (!content.includes("FROZEN") || !content.includes("freeze-state.json")) {
          findings.push("Self-Audit Violation: GenerationFreezeController structure or freeze persistence is disabled/modified.");
          violationCount++;
        }
      }

      // 4. Report Generator integrity check
      if (baseName === "CertificationReportGenerator.ts") {
        if (!content.includes("AIOS_GENERATION_5_CERTIFICATION.md")) {
          findings.push("Self-Audit Violation: CertificationReportGenerator output destination has been altered.");
          violationCount++;
        }
      }
    }

    const score = Math.max(0, 100 - violationCount * 20);
    return {
      success: violationCount === 0,
      score,
      findings
    };
  }

  private getTsFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        results = results.concat(this.getTsFiles(filePath));
      } else if (file.endsWith(".ts")) {
        results.push(filePath);
      }
    }
    return results;
  }
}
