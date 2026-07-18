import * as fs from "fs";
import * as path from "path";

export class RuntimeArchitectureAuditor {
  private static readonly RUNTIMES = [
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

  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(__dirname, "../..");
  }

  /**
   * Performs static analysis check for runtime structure and direct import violations.
   */
  public audit(): { success: boolean; score: number; findings: string[] } {
    const findings: string[] = [];
    let checkedCount = 0;
    let violationCount = 0;

    for (const runtime of RuntimeArchitectureAuditor.RUNTIMES) {
      const runtimeDir = this.findRuntimePath(runtime);
      if (!runtimeDir || !fs.existsSync(runtimeDir)) {
        findings.push(`Architecture Block: Runtime directory for '${runtime}' is missing.`);
        violationCount++;
        continue;
      }

      checkedCount++;
      // Scan all ts files in this runtime directory recursively
      const tsFiles = this.getTsFiles(runtimeDir);
      for (const file of tsFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const violations = this.scanFileImports(file, content, runtime);
        for (const v of violations) {
          findings.push(v);
          violationCount++;
        }
      }
    }

    const score = Math.max(0, 100 - violationCount * 10);
    return {
      success: violationCount === 0 && checkedCount > 0,
      score,
      findings
    };
  }

  private findRuntimePath(runtime: string): string | null {
    const possiblePaths = [
      path.join(this.baseDir, runtime),
      path.join(this.baseDir, "development", runtime), // For completion
      path.join(this.baseDir, "..", "core", runtime),  // For core runtimes
      path.join(this.baseDir, "..", "sdk", runtime)    // For sdk runtimes
    ];

    // Explicit mappings for audit and learning alternate folders
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

  /**
   * Scans imports for direct dependency violations using resolved absolute paths.
   */
  private scanFileImports(filePath: string, content: string, currentRuntime: string): string[] {
    const violations: string[] = [];
    const lines = content.split("\n");
    const currentRuntimeDir = this.findRuntimePath(currentRuntime);
    if (!currentRuntimeDir) return [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("import ") && line.includes("from ")) {
        const match = line.match(/from\s+["']([^"']+)["']/);
        if (match) {
          const importPath = match[1];
          if (importPath.startsWith(".")) {
            // Resolve absolute import path
            const resolvedPath = path.resolve(path.dirname(filePath), importPath);
            // Verify if it leaves the current runtime directory boundary
            if (!resolvedPath.startsWith(currentRuntimeDir)) {
              for (const otherRuntime of RuntimeArchitectureAuditor.RUNTIMES) {
                if (otherRuntime === currentRuntime) continue;
                const otherRuntimeDir = this.findRuntimePath(otherRuntime);
                if (otherRuntimeDir && resolvedPath.startsWith(otherRuntimeDir)) {
                  // Common message bus / registry is allowed
                  if (otherRuntime === "orchestration") continue;

                  // Exclude allowed contracts, events, registry or config imports
                  if (
                    !importPath.includes("contracts") &&
                    !importPath.includes("events") &&
                    !importPath.includes("registry")
                  ) {
                    const relativeFile = path.basename(filePath);
                    violations.push(
                      `Forbidden Dependency: ${relativeFile}:${i + 1} directly imports '${otherRuntime}' via '${importPath}'`
                    );
                  }
                }
              }
            }
          }
        }
      }
    }

    return violations;
  }
}
