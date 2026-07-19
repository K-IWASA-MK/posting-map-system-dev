import fs from 'fs';
import path from 'path';
import { IValidator, ValidationResult } from './types';

export class DependencyScanner implements IValidator {
  public readonly id = 'DependencyScanner';
  public readonly name = 'Dependency Graph & Circular Reference Scanner';

  private readonly rootDir = path.resolve(__dirname, '../..');

  public async validate(): Promise<ValidationResult> {
    const startTime = Date.now();
    const messages: string[] = [];
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    try {
      const files = this.getAllTsFiles(this.rootDir);
      const dependencyGraph = new Map<string, string[]>();

      // Build dependency graph
      for (const file of files) {
        const relativeFile = path.relative(this.rootDir, file);
        const imports = this.extractImports(file);
        const resolvedImports: string[] = [];

        for (const imp of imports) {
          const resolved = this.resolveImport(file, imp);
          if (resolved) {
            const relResolved = path.relative(this.rootDir, resolved);
            resolvedImports.push(relResolved);

            // Layer Violation Check: Core -> Application Dependency
            if (this.isCorePath(relativeFile) && this.isAppPath(relResolved)) {
              status = 'FAIL';
              messages.push(`❌ Layer Violation: Core file '${relativeFile}' imports from Application file '${relResolved}'`);
            }
          }
        }
        dependencyGraph.set(relativeFile, resolvedImports);
      }

      // Cycle Detection (DAG validation)
      const visited = new Set<string>();
      const recStack = new Set<string>();
      const cycles: string[][] = [];

      const findCycles = (node: string, pathStack: string[]) => {
        visited.add(node);
        recStack.add(node);
        pathStack.push(node);

        const neighbors = dependencyGraph.get(node) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            findCycles(neighbor, [...pathStack]);
          } else if (recStack.has(neighbor)) {
            const cycleIndex = pathStack.indexOf(neighbor);
            if (cycleIndex !== -1) {
              cycles.push([...pathStack.slice(cycleIndex), neighbor]);
            }
          }
        }

        recStack.delete(node);
      };

      for (const node of dependencyGraph.keys()) {
        if (!visited.has(node)) {
          findCycles(node, []);
        }
      }

      if (cycles.length > 0) {
        let hasCriticalCycle = false;
        const criticalCycles: string[][] = [];
        const warningCycles: string[][] = [];

        for (const cycle of cycles) {
          const isSdkCycle = cycle.every(node => node.startsWith('sdk/'));
          const isSameFolderCycle = this.areInSameFolder(cycle);

          if (isSdkCycle || isSameFolderCycle) {
            warningCycles.push(cycle);
          } else {
            hasCriticalCycle = true;
            criticalCycles.push(cycle);
          }
        }

        if (hasCriticalCycle) {
          status = 'FAIL';
          messages.push(`❌ Critical Circular Dependencies detected (${criticalCycles.length} cycles found):`);
          for (const cycle of criticalCycles) {
            messages.push(`   Cycle: ${cycle.join(' -> ')}`);
          }
        }

        if (warningCycles.length > 0) {
          if (status !== 'FAIL') status = 'WARNING';
          messages.push(`⚠️ Legacy/Internal Circular Dependencies detected (${warningCycles.length} cycles found):`);
          for (const cycle of warningCycles) {
            messages.push(`   Cycle: ${cycle.join(' -> ')}`);
          }
        }
      }

      if (status === 'PASS') {
        messages.push(`✅ Dependency Graph built successfully with ${files.length} nodes.`);
        messages.push('✅ No circular dependencies detected (DAG confirmed).');
        messages.push('✅ No Core-to-Application layer violations detected.');
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

  private areInSameFolder(cycle: string[]): boolean {
    if (cycle.length === 0) return true;
    const firstDir = path.dirname(cycle[0]);
    return cycle.every(node => path.dirname(node) === firstDir);
  }

  private getAllTsFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;
    
    // Skip external/temporary directories and any node_modules folder
    const skipDirs = ['.git', 'node_modules', 'dist', 'docs', 'scratch', 'projects/posting-map/active/mobile/assets'];
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(this.rootDir, filePath);

      if (skipDirs.some(skip => relativePath === skip || relativePath.startsWith(skip + '/')) || filePath.includes('node_modules')) {
        continue;
      }

      if (fs.statSync(filePath).isDirectory()) {
        this.getAllTsFiles(filePath, fileList);
      } else if (filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  private extractImports(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    const imports: string[] = [];
    
    // Match standard imports, but ignore 'import type'
    const importRegex = /import\s+(?!type\b)(?:.*?from\s+)?['"](.*?)['"]/g;
    let match;
    while ((match = importRegex.exec(cleanContent)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  }

  private resolveImport(sourceFile: string, importPath: string): string | null {
    // We only resolve local workspace imports, not node_modules
    if (!importPath.startsWith('.') && !importPath.startsWith('@') && !importPath.startsWith('core/') && !importPath.startsWith('runtime/') && !importPath.startsWith('kernel/') && !importPath.startsWith('sdk/')) {
      return null;
    }

    let targetPath = '';

    // Handle path aliases
    if (importPath.startsWith('@core/')) {
      targetPath = path.join(this.rootDir, 'core', importPath.substring(6));
    } else if (importPath.startsWith('@runtime/')) {
      targetPath = path.join(this.rootDir, 'runtime', importPath.substring(9));
    } else if (importPath.startsWith('@sdk/')) {
      targetPath = path.join(this.rootDir, 'sdk', importPath.substring(5));
    } else if (importPath.startsWith('core/')) {
      targetPath = path.join(this.rootDir, 'core', importPath.substring(5));
    } else if (importPath.startsWith('runtime/')) {
      targetPath = path.join(this.rootDir, 'runtime', importPath.substring(8));
    } else if (importPath.startsWith('kernel/')) {
      targetPath = path.join(this.rootDir, 'kernel', importPath.substring(7));
    } else if (importPath.startsWith('sdk/')) {
      targetPath = path.join(this.rootDir, 'sdk', importPath.substring(4));
    } else if (importPath.startsWith('.')) {
      targetPath = path.resolve(path.dirname(sourceFile), importPath);
    } else {
      return null;
    }

    // Try extensions
    const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
      const fullPath = targetPath + ext;
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return fullPath;
      }
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
      return targetPath;
    }

    return null;
  }

  private isCorePath(relPath: string): boolean {
    return relPath.startsWith('core/') || relPath.startsWith('runtime/') || relPath.startsWith('kernel/') || relPath.startsWith('sdk/');
  }

  private isAppPath(relPath: string): boolean {
    return relPath.startsWith('apps/') || relPath.startsWith('projects/');
  }
}
