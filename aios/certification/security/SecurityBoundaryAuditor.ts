import * as fs from "fs";
import * as path from "path";

export class SecurityBoundaryAuditor {
  private readonly baseDir: string;

  // Patterns indicating hardcoded secret assignments
  private static readonly HARDCODED_SECRET_PATTERNS = [
    /const\s+api[_-]?key\s*=\s*["'][a-zA-Z0-9_\-]{16,}["']/i,
    /const\s+token\s*=\s*["'][a-zA-Z0-9_\-]{16,}["']/i,
    /const\s+secret\s*=\s*["'][a-zA-Z0-9_\-]{16,}["']/i,
    /["']sk-[a-zA-Z0-9]{48}["']/ // OpenAI secret key literal
  ];

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(__dirname, "../..");
  }

  /**
   * Safe code scanning for security vulnerabilities.
   */
  public audit(): { success: boolean; score: number; findings: string[] } {
    const findings: string[] = [];
    let violationCount = 0;

    const runtimes = [
      "execution",
      "validation",
      "audit",
      "learning",
      "completion",
      "orchestration",
      "observability",
      "release",
      "autonomous",
      "certification"
    ];

    for (const runtime of runtimes) {
      const runtimeDir = this.findRuntimePath(runtime);
      if (!runtimeDir || !fs.existsSync(runtimeDir)) continue;

      const tsFiles = this.getTsFiles(runtimeDir);
      for (const file of tsFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const baseName = path.basename(file);

        // 1. Scan for hardcoded secret assignments
        for (const pattern of SecurityBoundaryAuditor.HARDCODED_SECRET_PATTERNS) {
          if (pattern.test(content)) {
            findings.push(`Security Violation: Hardcoded secret pattern found in ${runtime}/${baseName}`);
            violationCount++;
          }
        }

        // 2. Scan for Path Traversal vulnerability checks
        // E.g., release runtime must verify paths are within project boundary.
        if (runtime === "release" && baseName === "ReleaseIntegrityVerifier.ts") {
          const hasPathCheck = content.includes("resolve") || content.includes("startsWith") || content.includes("pathTraversal");
          if (!hasPathCheck) {
            findings.push(`Security Advisory: Path traversal checks missing in release auditor ${baseName}`);
            violationCount++;
          }
        }

        // 3. Verify SecretProvider implementation/use
        if (runtime === "autonomous" && baseName === "AutonomousExecutionController.ts") {
          const usesSecretProvider = content.includes("SecretProvider");
          if (!usesSecretProvider) {
            findings.push("Security Violation: AutonomousController does not consume SecretProvider for API credential access.");
            violationCount++;
          }
        }
      }
    }

    const score = Math.max(0, 100 - violationCount * 15);
    return {
      success: violationCount === 0,
      score,
      findings
    };
  }

  private findRuntimePath(runtime: string): string | null {
    const possiblePaths = [
      path.join(this.baseDir, runtime),
      path.join(this.baseDir, "development", runtime),
      path.join(this.baseDir, "..", "core", runtime),
      path.join(this.baseDir, "..", "sdk", runtime)
    ];

    if (runtime === "audit") {
      possiblePaths.push(path.join(this.baseDir, "..", "core", "trust-runtime"));
    }
    if (runtime === "learning") {
      possiblePaths.push(path.join(this.baseDir, "..", "sdk", "core", "learning"));
      possiblePaths.push(path.join(this.baseDir, "..", "sdk", "learning", "os"));
    }

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return null;
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
