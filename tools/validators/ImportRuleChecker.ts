import fs from 'fs';
import path from 'path';
import { IValidator, ValidationResult } from './types';

export class ImportRuleChecker implements IValidator {
  public readonly id = 'ImportRuleChecker';
  public readonly name = 'Application Import Rule Checker';

  private readonly rootDir = path.resolve(__dirname, '../..');

  public async validate(): Promise<ValidationResult> {
    const startTime = Date.now();
    const messages: string[] = [];
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    try {
      const appFiles = this.getAppFiles(this.rootDir);
      let violationsCount = 0;

      for (const file of appFiles) {
        const relativeFile = path.relative(this.rootDir, file);
        const content = fs.readFileSync(file, 'utf-8');
        const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];

          // Forbidden Direct Import patterns from Applications to Core internals
          const isForbiddenInternal = 
            importPath.includes('/kernel') ||
            importPath.includes('/runtime') ||
            importPath.includes('/capability') ||
            importPath.includes('internal/') ||
            importPath.startsWith('core/') ||
            importPath.startsWith('runtime/') ||
            importPath.startsWith('kernel/') ||
            importPath.startsWith('@core') ||
            importPath.startsWith('@runtime') ||
            importPath.startsWith('@kernel');

          // Check if it is a relative path that resolves into Core/Runtime/Kernel
          let resolvesToInternal = false;
          if (importPath.startsWith('.')) {
            const resolvedPath = path.resolve(path.dirname(file), importPath);
            const relativeToRoot = path.relative(this.rootDir, resolvedPath);
            const internalDirs = ['core/', 'runtime/', 'kernel/', 'automation/', 'governance/', 'monitoring/'];
            
            if (internalDirs.some(dir => relativeToRoot.startsWith(dir))) {
              resolvesToInternal = true;
            }
          }

          if (isForbiddenInternal || resolvesToInternal) {
            status = 'FAIL';
            violationsCount++;
            messages.push(`❌ Import Violation in '${relativeFile}':`);
            messages.push(`   Forbidden import target: '${importPath}'`);
          }
        }
      }

      if (status === 'PASS') {
        messages.push(`✅ Scanned Application files for import violations.`);
        messages.push('✅ No forbidden internal platform imports or relative references found.');
      } else {
        messages.push(`❌ Total of ${violationsCount} internal platform import violation(s) found.`);
      }
    } catch (err: any) {
      status = 'FAIL';
      messages.push(`❌ Execution failed: ${err.message}`);
    }

    return {
      validatorId: this.id,
      status,
      messages,
      duration: Date.now() - startTime
    };
  }

  private getAppFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(this.rootDir, filePath);

      // Only scan projects and apps directories
      if (relativePath.startsWith('projects/') || relativePath.startsWith('apps/')) {
        if (fs.statSync(filePath).isDirectory()) {
          this.getAppFiles(filePath, fileList);
        } else if (filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')) {
          fileList.push(filePath);
        }
      }
    }
    return fileList;
  }
}
