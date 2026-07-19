import fs from 'fs';
import path from 'path';
import { IValidator, ValidationResult } from './types';

export class DomainIsolationValidator implements IValidator {
  public readonly id = 'DomainIsolationValidator';
  public readonly name = 'Domain Isolation Validator';

  private readonly rootDir = path.resolve(__dirname, '../..');

  // Folders to scan for AIOS Core
  private readonly scanDirs = ['kernel', 'runtime', 'core', 'sdk'];

  // Prohibited words in AIOS Core
  private readonly forbiddenWords = ['election', 'posting', 'flyer', 'district', 'spreadsheet', 'dashboard'];
  private readonly warningWords: string[] = [];

  public async validate(): Promise<ValidationResult> {
    const startTime = Date.now();
    const messages: string[] = [];
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
    const renamePreparationList: string[] = [];

    try {
      const files = this.getCoreFiles(this.rootDir);
      let forbiddenCount = 0;
      let warningCount = 0;

      for (const file of files) {
        const relativeFile = path.relative(this.rootDir, file);

        // 1. Check folder/file name
        const pathParts = relativeFile.toLowerCase().split(path.sep);

        // Check if any forbidden words are in file name or folder path
        for (const word of this.forbiddenWords) {
          if (pathParts.some(part => this.hasForbiddenWord(part, word))) {
            status = 'FAIL';
            forbiddenCount++;
            messages.push(`❌ Forbidden Domain Term in Path: '${relativeFile}' contains word '${word}'`);
          }
        }

        // Check warning words (Dashboard) in file name or folder path
        for (const word of this.warningWords) {
          if (pathParts.some(part => this.hasForbiddenWord(part, word))) {
            if (status !== 'FAIL') status = 'WARNING';
            warningCount++;
            messages.push(`⚠️ WARNING: Domain Term in Path: '${relativeFile}' contains word '${word}' (scheduled for Phase 3 rename)`);
            if (!renamePreparationList.includes(relativeFile)) {
              renamePreparationList.push(relativeFile);
            }
          }
        }

        // 2. Check file content
        const content = fs.readFileSync(file, 'utf-8');

        for (const word of this.forbiddenWords) {
          if (this.hasForbiddenWord(content, word)) {
            // Find lines containing the word
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (this.hasForbiddenWord(line, word)) {
                status = 'FAIL';
                forbiddenCount++;
                messages.push(`❌ Forbidden Domain Term in Content: '${relativeFile}' Line ${idx + 1} contains word '${word}'`);
              }
            });
          }
        }

        for (const word of this.warningWords) {
          if (this.hasForbiddenWord(content, word)) {
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (this.hasForbiddenWord(line, word)) {
                if (status !== 'FAIL') status = 'WARNING';
                warningCount++;
                messages.push(`⚠️ WARNING: Domain Term in Content: '${relativeFile}' Line ${idx + 1} contains word '${word}' (scheduled for Phase 3 rename)`);
                if (!renamePreparationList.includes(relativeFile)) {
                  renamePreparationList.push(relativeFile);
                }
              }
            });
          }
        }
      }

      // Save DashboardRenamePreparation list if any matches found
      if (renamePreparationList.length > 0) {
        const prepFilePath = path.join(this.rootDir, 'docs/specifications/DashboardRenamePreparation.md');
        const prepContent = this.generateRenamePreparationMarkdown(renamePreparationList);
        fs.writeFileSync(prepFilePath, prepContent, 'utf-8');
        messages.push(`📝 Registered ${renamePreparationList.length} files in docs/specifications/DashboardRenamePreparation.md`);
      }

      if (status === 'PASS') {
        messages.push('✅ Checked platform core folders: no domain-specific words found.');
      } else if (status === 'WARNING') {
        messages.push(`⚠️ Quality Gate Passed with Warnings. Found ${warningCount} occurrence(s) of warning word 'dashboard'. Registered for Phase 3 rename.`);
      } else {
        messages.push(`❌ Domain Isolation Failed. Found ${forbiddenCount} forbidden domain word occurrence(s).`);
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

  private getCoreFiles(rootDir: string, fileList: string[] = []): string[] {
    for (const dirName of this.scanDirs) {
      const fullDir = path.join(rootDir, dirName);
      if (fs.existsSync(fullDir)) {
        this.traverse(fullDir, fileList);
      }
    }
    return fileList;
  }

  private traverse(dir: string, fileList: string[]) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.traverse(filePath, fileList);
      } else if (filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')) {
        fileList.push(filePath);
      }
    }
  }

  private generateRenamePreparationMarkdown(files: string[]): string {
    return `# Dashboard リネーム影響範囲調査結果 (Dashboard Rename Preparation)

## 概要
本ドキュメントは、AIOS v6.0 Phase 2 で実施された Domain Isolation 検証において、AIOS Core 内から検出された \`Dashboard\` 関連のキーワードを含むファイルおよび影響範囲をリスト化したものです。これらのファイルおよびシンボルは、Phase 3 において \`Console\` または \`Monitor\` へと完全にリネーム・リファクタリングされます。

## リファクタリング対象ファイル一覧
計 ${files.length} 件

${files.map((file, idx) => `${idx + 1}. [${path.basename(file)}](file://${path.resolve(this.rootDir, file)}) (\`${file}\`)`).join('\n')}

## 影響範囲と移行設計案
- **\`DashboardRegistry.ts\`** ➔ **\`MonitorRegistry.ts\`** / **\`ConsoleRegistry.ts\`**
- **\`DashboardRuntime.ts\`** ➔ **\`MonitorRuntime.ts\`** / **\`ConsoleRuntime.ts\`**
- **\`DashboardState.ts\`** ➔ **\`MonitorState.ts\`**
- **\`DashboardPolicy.ts\`** ➔ **\`MonitorPolicy.ts\`**
- **\`DashboardLedger.ts\`** ➔ **\`MonitorLedger.ts\`**
- **\`DashboardServices.ts\`** ➔ **\`MonitorServices.ts\`**
- **\`DashboardMetricsCollector.ts\`** ➔ **\`MonitorMetricsCollector.ts\`**

これらの名称変更に伴い、SDK から公開されている型定義および re-export も変更されます。
`;
  }

  private hasForbiddenWord(text: string, word: string): boolean {
    if (word === 'election') {
      return /(?<!s)election/i.test(text);
    }
    return text.toLowerCase().includes(word);
  }
}
