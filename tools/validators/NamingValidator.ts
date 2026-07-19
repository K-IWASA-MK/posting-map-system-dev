import fs from 'fs';
import path from 'path';
import { IValidator, ValidationResult } from './types';

export class NamingValidator implements IValidator {
  public readonly id = 'NamingValidator';
  public readonly name = 'Naming Convention & Casing Validator';

  private readonly rootDir = path.resolve(__dirname, '../..');
  private readonly scanDirs = ['kernel', 'runtime', 'core', 'sdk'];

  public async validate(): Promise<ValidationResult> {
    const startTime = Date.now();
    const messages: string[] = [];
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

    try {
      const files = this.getCoreFiles(this.rootDir);
      let violationsCount = 0;

      for (const file of files) {
        const relativeFile = path.relative(this.rootDir, file);
        const fileName = path.basename(file);
        
        // Strip .test.ts, .spec.ts, or .ts to get the base class name candidates
        const fileBase = fileName.replace(/\.(test|spec)\.ts$/, '').replace(/\.ts$/, '');

        // 1. File Naming: Must be PascalCase unless it is index.ts/types.ts
        if (fileName !== 'index.ts' && fileName !== 'package.json' && fileName !== 'tsconfig.json' && fileName !== 'types.ts') {
          if (!this.isPascalCase(fileBase)) {
            status = 'FAIL';
            violationsCount++;
            messages.push(`❌ File Naming Violation in '${relativeFile}': File name must be PascalCase.`);
          }
        }

        // 2. Strip comments to avoid checking classes/interfaces in comments/docs
        const content = fs.readFileSync(file, 'utf-8');
        const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

        // Class Naming: class ClassName
        const classRegex = /\bclass\s+([A-Za-z0-9_]+)/g;
        let classMatch;
        while ((classMatch = classRegex.exec(cleanContent)) !== null) {
          const className = classMatch[1];
          if (!this.isPascalCase(className)) {
            status = 'FAIL';
            violationsCount++;
            messages.push(`❌ Class Naming Violation in '${relativeFile}': Class '${className}' must be PascalCase.`);
          }

          // If it's the main class, check if it matches the file name
          if (fileName !== 'index.ts' && className.toLowerCase() === fileBase.toLowerCase() && className !== fileBase) {
            status = 'FAIL';
            violationsCount++;
            messages.push(`❌ Class/File Mismatch in '${relativeFile}': Class '${className}' doesn't exactly match file name casing '${fileBase}'.`);
          }
        }

        // Interface Naming: interface InterfaceName
        const interfaceRegex = /\binterface\s+([A-Za-z0-9_]+)/g;
        let interfaceMatch;
        while ((interfaceMatch = interfaceRegex.exec(cleanContent)) !== null) {
          const interfaceName = interfaceMatch[1];
          if (!this.isPascalCase(interfaceName)) {
            status = 'FAIL';
            violationsCount++;
            messages.push(`❌ Interface Naming Violation in '${relativeFile}': Interface '${interfaceName}' must be PascalCase.`);
          }
        }

        // Event Naming: Check events emitted or logged (often UPPER_SNAKE_CASE)
        const eventEmitRegex = /write\(['"][A-Za-z0-9_]+['"]\s*,\s*['"]([A-Za-z0-9_]+)['"]/g;
        let eventMatch;
        while ((eventMatch = eventEmitRegex.exec(cleanContent)) !== null) {
          const eventName = eventMatch[1];
          if (!this.isUpperSnakeCase(eventName) && !this.isPascalCase(eventName)) {
            if (this.isCamelCase(eventName)) {
              status = 'FAIL';
              violationsCount++;
              messages.push(`❌ Event Naming Violation in '${relativeFile}': Event name '${eventName}' should be UPPER_SNAKE_CASE or PascalCase.`);
            }
          }
        }
      }

      // 3. Folder Naming: lowercase or kebab-case
      const folders = this.getCoreFolders(this.rootDir);
      for (const folder of folders) {
        const folderName = path.basename(folder);
        if (!this.isKebabCaseOrLower(folderName)) {
          // If it's a specific folder under apps or projects it can be PascalCase,
          // but for core/runtime/kernel/sdk, we enforce kebab-case or lowercase.
          // Wait, is there any exception? (e.g., core/evolution etc are lowercase).
          status = 'FAIL';
          violationsCount++;
          messages.push(`❌ Folder Naming Violation: Folder '${path.relative(this.rootDir, folder)}' must be lowercase or kebab-case.`);
        }
      }

      if (status === 'PASS') {
        messages.push('✅ Checked file, class, interface, and folder casing conventions. No violations found.');
      } else {
        messages.push(`❌ Naming Convention validation failed with ${violationsCount} violations.`);
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

  private isPascalCase(str: string): boolean {
    return /^[A-Z][A-Za-z0-9]*$/.test(str);
  }

  private isUpperSnakeCase(str: string): boolean {
    return /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(str);
  }

  private isCamelCase(str: string): boolean {
    return /^[a-z][A-Za-z0-9]*$/.test(str);
  }

  private isKebabCaseOrLower(str: string): boolean {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
  }

  private getCoreFiles(rootDir: string, fileList: string[] = []): string[] {
    for (const dirName of this.scanDirs) {
      const fullDir = path.join(rootDir, dirName);
      if (fs.existsSync(fullDir)) {
        this.traverseFiles(fullDir, fileList);
      }
    }
    return fileList;
  }

  private traverseFiles(dir: string, fileList: string[]) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.traverseFiles(filePath, fileList);
      } else if (filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')) {
        fileList.push(filePath);
      }
    }
  }

  private getCoreFolders(rootDir: string, folderList: string[] = []): string[] {
    for (const dirName of this.scanDirs) {
      const fullDir = path.join(rootDir, dirName);
      if (fs.existsSync(fullDir)) {
        this.traverseFolders(fullDir, folderList);
      }
    }
    return folderList;
  }

  private traverseFolders(dir: string, folderList: string[]) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        folderList.push(filePath);
        this.traverseFolders(filePath, folderList);
      }
    }
  }
}
