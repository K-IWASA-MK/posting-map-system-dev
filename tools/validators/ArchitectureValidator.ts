import fs from 'fs';
import path from 'path';
import { IValidator, ValidationResult } from './types';

export class ArchitectureValidator implements IValidator {
  public readonly id = 'ArchitectureValidator';
  public readonly name = 'Architecture Layer & Decoupling Validator';

  private readonly rootDir = path.resolve(__dirname, '../..');

  // Allowed dependencies between application layers
  private readonly allowedDependencies: Record<string, string[]> = {
    'core': [],
    'foundation': ['core'],
    'domain': ['core', 'foundation'],
    'application': ['core', 'foundation', 'domain'],
    'infrastructure': ['core', 'foundation', 'domain'],
    'api': ['core', 'foundation', 'application']
  };

  public async validate(): Promise<ValidationResult> {
    const startTime = Date.now();
    const messages: string[] = [];
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    try {
      const srcDir = path.join(this.rootDir, 'projects/posting-map/src');
      if (!fs.existsSync(srcDir)) {
        messages.push(`⚠️ Application source directory not found at '${srcDir}'. Skipping.`);
        return {
          validatorId: this.id,
          status: 'WARNING',
          messages,
          duration: Date.now() - startTime
        };
      }

      const layers = Object.keys(this.allowedDependencies);
      let violationsCount = 0;

      for (const layer of layers) {
        const layerDir = path.join(srcDir, layer);
        const files = this.getFiles(layerDir);

        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
          let match;

          while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];

            // 1. Layer Dependency Rules Check
            for (const targetLayer of layers) {
              if (importPath.startsWith(`@${targetLayer}`) || importPath.includes(`/src/${targetLayer}/`)) {
                if (layer !== targetLayer && !this.allowedDependencies[layer].includes(targetLayer)) {
                  status = 'FAIL';
                  violationsCount++;
                  messages.push(`❌ Layer Direction Violation in '${path.relative(this.rootDir, file)}':`);
                  messages.push(`   Layer '${layer}' is not allowed to depend on target layer '${targetLayer}' (Import: '${importPath}')`);
                }

                // S5-2 rule: infrastructure must not depend on domain services (business logic)
                if (layer === 'infrastructure' && targetLayer === 'domain') {
                  if (importPath.includes('/services/') || importPath.includes('@domain/field/services')) {
                    status = 'FAIL';
                    violationsCount++;
                    messages.push(`❌ Domain Service Reference Violation in '${path.relative(this.rootDir, file)}':`);
                    messages.push(`   Infrastructure is not allowed to import domain services directly (Import: '${importPath}')`);
                  }
                }
              }
            }
          }
        }
      }

      // 2. Domain Cross-Dependencies Check (No direct feature-to-feature import)
      const domainDir = path.join(srcDir, 'domain');
      if (fs.existsSync(domainDir)) {
        const domainFeatures = fs.readdirSync(domainDir).filter(f => fs.statSync(path.join(domainDir, f)).isDirectory());
        
        for (const feature of domainFeatures) {
          const featureFiles = this.getFiles(path.join(domainDir, feature));
          for (const file of featureFiles) {
            const content = fs.readFileSync(file, 'utf-8');
            const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
            let match;

            while ((match = importRegex.exec(content)) !== null) {
              const importPath = match[1];
              for (const otherFeature of domainFeatures) {
                if (feature !== otherFeature && importPath.includes(`@domain/${otherFeature}`)) {
                  status = 'FAIL';
                  violationsCount++;
                  messages.push(`❌ Domain Cross-Dependency Violation in '${path.relative(this.rootDir, file)}':`);
                  messages.push(`   Domain '${feature}' is not allowed to import directly from domain '${otherFeature}' (Import: '${importPath}')`);
                }
              }
            }
          }
        }
      }

      if (status === 'PASS') {
        messages.push('✅ Architecture Layer directions verified.');
        messages.push('✅ Infrastructure decoupling from domain services verified.');
        messages.push('✅ Domain isolation (no cross-feature dependencies) verified.');
      } else {
        messages.push(`❌ Total of ${violationsCount} architecture layer violation(s) found.`);
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

  private getFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (file === 'bootstrap') continue; // Skip composition roots
        this.getFiles(filePath, fileList);
      } else if (filePath.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }
}
