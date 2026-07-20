import { ReviewRule, ReviewContext } from '../ReviewRule';
import { ReviewViolation } from '../ReviewResult';
import * as path from 'path';
import * as fs from 'fs';

export class ArchitecturePolicyRule implements ReviewRule {
  public readonly id = 'RULE-G6-01-ARCH-POLICY';
  public readonly name = 'Architecture Policy Compliance';
  public readonly category = 'Policy' as const;

  public async evaluate(context: ReviewContext): Promise<ReviewViolation[]> {
    const violations: ReviewViolation[] = [];

    const platformInternalDirs = [
      'core/',
      'runtime/',
      'automation/',
      'governance/',
      'monitoring/',
      'optimization/',
      'selfregulation/',
      'transformation/',
      'audit/',
      'learning/'
    ];

    for (const file of context.proposedFiles) {
      if (!fs.existsSync(file)) continue;

      const ext = path.extname(file);
      if (ext !== '.ts' && ext !== '.js') continue;

      try {
        const content = fs.readFileSync(file, 'utf-8');
        const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          const workspaceRoot = path.resolve(__dirname, '../../..');
          const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');

          // Enforce platform internal boundary for posting-map app
          if (relativePath.startsWith('projects/posting-map/')) {
            // 1. Check relative imports
            if (importPath.startsWith('.')) {
              const resolvedPath = path.resolve(path.dirname(file), importPath);
              const relativeImport = path.relative(workspaceRoot, resolvedPath).replace(/\\/g, '/');

              if (platformInternalDirs.some(dir => relativeImport.startsWith(dir))) {
                violations.push({
                  ruleId: this.id,
                  severity: 'ERROR',
                  message: `Internal Platform Import Violation in "${relativePath}": App is not allowed to import directly from platform internals. (Import: "${importPath}" resolves to "${relativeImport}")`,
                  targetFile: file,
                  remediation: 'Use the public SDK interface instead of linking directly to platform internal modules.'
                });
              }
            }

            // 2. Check alias or direct absolute imports
            if (platformInternalDirs.some(dir => importPath.startsWith(dir))) {
              violations.push({
                ruleId: this.id,
                severity: 'ERROR',
                message: `Internal Platform Import Violation in "${relativePath}": App is not allowed to import directly from platform internals. (Import: "${importPath}")`,
                targetFile: file,
                remediation: 'Use the public SDK interface instead of linking directly to platform internal modules.'
              });
            }
          }
        }
      } catch (err: any) {
        // Ignore read/parse errors silently
      }
    }

    return violations;
  }
}
