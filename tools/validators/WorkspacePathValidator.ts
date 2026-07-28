import fs from 'fs';
import path from 'path';
import { IValidator, ValidationResult } from './types';
import { WorkspacePathAuditLogger } from '../../projects/posting-map/src/shared/audit/WorkspacePathAuditLogger';

export class WorkspacePathValidator implements IValidator {
  public readonly id = 'WorkspacePathValidator';
  public readonly name = 'Workspace Path Architecture Guard';

  private readonly rootDir = path.resolve(__dirname, '../..');
  private readonly targetDir = path.join(this.rootDir, 'projects', 'posting-map');

  public async validate(): Promise<ValidationResult> {
    const startTime = Date.now();
    const messages: string[] = [];
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    const auditLogger = WorkspacePathAuditLogger.getInstance();
    auditLogger.logEvent({
      componentName: this.id,
      eventType: 'VALIDATION_STARTED',
      executionContext: { targetDir: this.targetDir }
    });

    try {
      let violationsCount = 0;
      const tsFiles = this.getTsFiles(this.targetDir);

      for (const file of tsFiles) {
        const relativeFile = path.relative(this.rootDir, file).replace(/\\/g, '/');
        const fileName = path.basename(file);

        // Exempt resolver files and self
        if (
          fileName === 'PostingMapPathResolver.ts' ||
          fileName === 'test_posting_map_path_resolver.ts' ||
          fileName === 'test_workspace_path_guard.ts' ||
          fileName === 'test_workspace_path_audit.ts' ||
          fileName === 'RootResolver.ts' ||
          fileName === 'WorkspacePathValidator.ts'
        ) {
          continue;
        }

        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNum = i + 1;

          // Strip comments
          const cleanLine = line.replace(/\/\/.*/, '').replace(/\/\*.*?\*\//, '');

          // Check direct path construction patterns
          const containsFieldOps = cleanLine.includes('"FIELD_OPERATIONS_PLATFORM"') || cleanLine.includes("'FIELD_OPERATIONS_PLATFORM'");
          const containsBranch = cleanLine.includes('"03_BRANCH"') || cleanLine.includes("'03_BRANCH'");
          const containsPathJoin = cleanLine.includes('path.join') || cleanLine.includes('fs.mkdirSync');

          if (containsPathJoin && (containsFieldOps || containsBranch)) {
            status = 'FAIL';
            violationsCount++;
            messages.push(
              `❌ [Workspace Path Guard Violation] in '${relativeFile}:${lineNum}': Direct construction of FIELD_OPERATIONS_PLATFORM / 03_BRANCH path detected without PostingMapPathResolver.\n   Line ${lineNum}: ${line.trim()}`
            );

            auditLogger.logEvent({
              componentName: this.id,
              eventType: 'RULE_VIOLATION_DETECTED',
              targetPath: `${relativeFile}:${lineNum}`,
              violatedRuleId: 'RULE-WORKSPACE-PATH-DIRECT-ACCESS',
              executionContext: { line: line.trim() }
            });
          }
        }
      }

      if (status === 'PASS') {
        messages.push('✅ Checked all POSTING MAP workspace path usages. All paths use PostingMapPathResolver (SSOT).');
        auditLogger.logEvent({
          componentName: this.id,
          eventType: 'VALIDATION_PASSED',
          validationResult: 'PASS'
        });
      } else {
        messages.push(`❌ Workspace Path Guard validation failed with ${violationsCount} violations.`);
        auditLogger.logEvent({
          componentName: this.id,
          eventType: 'VALIDATION_FAILED',
          validationResult: 'FAIL',
          executionContext: { violationsCount }
        });
      }
    } catch (err: any) {
      status = 'FAIL';
      messages.push(`❌ Execution failed: ${err.message}`);
      auditLogger.logEvent({
        componentName: this.id,
        eventType: 'VALIDATION_FAILED',
        validationResult: 'FAIL',
        executionContext: { error: err.message }
      });
    }

    return {
      validatorId: this.id,
      status,
      messages,
      duration: Date.now() - startTime
    };
  }

  private getTsFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          this.getTsFiles(itemPath, fileList);
        }
      } else if (itemPath.endsWith('.ts') && !itemPath.endsWith('.d.ts')) {
        fileList.push(itemPath);
      }
    }
    return fileList;
  }
}
