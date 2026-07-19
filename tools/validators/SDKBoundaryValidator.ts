import fs from 'fs';
import path from 'path';
import { IValidator, ValidationResult } from './types';

export class SDKBoundaryValidator implements IValidator {
  public readonly id = 'SDKBoundaryValidator';
  public readonly name = 'SDK Boundary & Barrel Export Leak Validator';

  private readonly rootDir = path.resolve(__dirname, '../..');

  public async validate(): Promise<ValidationResult> {
    const startTime = Date.now();
    const messages: string[] = [];
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    try {
      // 1. Audit sdk/index.ts for leaked internal imports/re-exports
      const sdkEntry = path.join(this.rootDir, 'sdk/index.ts');
      if (fs.existsSync(sdkEntry)) {
        const content = fs.readFileSync(sdkEntry, 'utf-8');
        const exportRegex = /export\s+.*?from\s+['"](.*?)['"]/g;
        let match;

        while ((match = exportRegex.exec(content)) !== null) {
          const exportPath = match[1];

          // Check if export path resolves outside the sdk directory (e.g. into core/runtime/kernel)
          const resolvedPath = path.resolve(path.dirname(sdkEntry), exportPath);
          const relativeToSdk = path.relative(path.join(this.rootDir, 'sdk'), resolvedPath);

          if (relativeToSdk.startsWith('..') && !relativeToSdk.startsWith('../..')) {
            // Pointing outside of sdk/, but within repository (e.g. ../core)
            status = 'FAIL';
            messages.push(`❌ SDK Boundary Leak: 'sdk/index.ts' re-exports from internal path '${exportPath}' (resolves outside sdk/ directory)`);
          }

          // Case-insensitive/literal forbidden patterns
          if (exportPath.includes('/core/') || exportPath.includes('/runtime/') || exportPath.includes('/kernel/') || exportPath.startsWith('@core') || exportPath.startsWith('@runtime') || exportPath.startsWith('@kernel')) {
            status = 'FAIL';
            messages.push(`❌ SDK Boundary Leak: 'sdk/index.ts' explicitly exports from platform internal: '${exportPath}'`);
          }
        }
      } else {
        messages.push(`⚠️ SDK entry point file 'sdk/index.ts' not found. Skipping entry audit.`);
      }

      // 2. Scan Application imports to ensure they only reference the SDK
      const appFiles = this.getAppFiles(this.rootDir);
      let appViolations = 0;

      for (const file of appFiles) {
        const relativeFile = path.relative(this.rootDir, file);
        const content = fs.readFileSync(file, 'utf-8');
        const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];

          // Application imports targeting platform internals directly (bypassing SDK)
          const bypassesSdk = 
            importPath.startsWith('@core') ||
            importPath.startsWith('@runtime') ||
            importPath.startsWith('@kernel') ||
            importPath.startsWith('core/') ||
            importPath.startsWith('runtime/') ||
            importPath.startsWith('kernel/');

          let relativeBypass = false;
          if (importPath.startsWith('.')) {
            const resolvedPath = path.resolve(path.dirname(file), importPath);
            const relativeToRoot = path.relative(this.rootDir, resolvedPath);
            const internalDirs = ['core/', 'runtime/', 'kernel/'];
            if (internalDirs.some(dir => relativeToRoot.startsWith(dir))) {
              relativeBypass = true;
            }
          }

          if (bypassesSdk || relativeBypass) {
            status = 'FAIL';
            appViolations++;
            messages.push(`❌ SDK Boundary Violation in '${relativeFile}':`);
            messages.push(`   Bypassed SDK to import directly from: '${importPath}'`);
          }
        }
      }

      if (status === 'PASS') {
        messages.push('✅ Checked SDK entry point: no internal leaks found.');
        messages.push('✅ Applications only import from SDK, no direct internal platform imports found.');
      } else if (appViolations > 0) {
        messages.push(`❌ Total of ${appViolations} application direct platform internal import violation(s) found.`);
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
