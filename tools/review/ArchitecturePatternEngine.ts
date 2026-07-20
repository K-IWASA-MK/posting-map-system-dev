import * as fs from 'fs';
import * as path from 'path';
import { ArchitecturePattern } from './ArchitecturePattern';

export class ArchitecturePatternEngine {
  private static get dbPath(): string {
    return path.resolve(__dirname, 'architecture_pattern_base.json');
  }

  /**
   * Loads all active patterns from the database.
   */
  public static load(): ArchitecturePattern[] {
    if (!fs.existsSync(this.dbPath)) {
      return [];
    }
    try {
      const content = fs.readFileSync(this.dbPath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error(`[ArchitecturePatternEngine] Failed to read patterns: ${err}`);
      return [];
    }
  }

  /**
   * Saves the patterns to the database.
   */
  public static save(patterns: ArchitecturePattern[]): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(patterns, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[ArchitecturePatternEngine] Failed to save patterns: ${err}`);
    }
  }

  /**
   * Evaluates the proposed files against active patterns.
   */
  public static query(proposedFiles: string[]): { pattern: ArchitecturePattern; confidence: number }[] {
    const matched: { pattern: ArchitecturePattern; confidence: number }[] = [];
    const workspaceRoot = path.resolve(__dirname, '../..');
    const patterns = this.load();

    for (const p of patterns) {
      if (p.stability === 'DEPRECATED') {
        continue;
      }

      let matchedFileCount = 0;

      for (const file of proposedFiles) {
        const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');
        const isAtRoot = !relativePath.includes('/');
        const ext = path.extname(file);

        let conditionsSatisfied = true;

        for (const cond of p.triggerConditions) {
          let matchedCondition = false;

          if (cond.startsWith('path-starts:')) {
            const prefix = cond.substring(12);
            if (relativePath.startsWith(prefix)) {
              matchedCondition = true;
            }
          } else if (cond.startsWith('root-file:')) {
            const glob = cond.substring(10); // e.g. "*.json" or "settings.json"
            if (isAtRoot) {
              if (glob === '*' || (glob.startsWith('*.') && ext === glob.substring(1))) {
                matchedCondition = true;
              } else if (relativePath === glob) {
                matchedCondition = true;
              }
            }
          } else if (cond === 'project-escape') {
            if (!relativePath.startsWith('projects/') && !relativePath.startsWith('sdk/') && !relativePath.startsWith('kernel/') && !relativePath.startsWith('tools/')) {
              matchedCondition = true;
            }
          }

          if (!matchedCondition) {
            conditionsSatisfied = false;
            break;
          }
        }

        if (conditionsSatisfied && p.triggerConditions.length > 0) {
          matchedFileCount++;
        }
      }

      if (matchedFileCount > 0) {
        matched.push({
          pattern: p,
          confidence: p.confidence
        });
      }
    }

    return matched;
  }

  /**
   * Scans a list of knowledges and synthesizes generalized patterns dynamically.
   */
  public static classify(knowledges: any[]): ArchitecturePattern[] {
    const derived: string[] = [];
    for (const k of knowledges) {
      if (k.pattern && k.pattern.includes('FIELD_OPERATIONS_PLATFORM')) {
        derived.push(k.id);
      }
    }

    if (derived.length >= 1) {
      const timestamp = new Date().toISOString();
      return [{
        id: 'PATTERN-AUTO-ROOT-ESCAPE',
        name: 'Auto-Classified Root Folder Escape Prevention',
        category: 'Boundary',
        description: 'Automatically synthesized pattern from multiple root pollution knowledges.',
        triggerConditions: ['project-escape', 'path-starts:FIELD_OPERATIONS_PLATFORM/'],
        recommendations: [{
          action: 'Ensure all application paths reside within the projects/ namespace.'
        }],
        stability: 'CANDIDATE',
        derivedFrom: derived,
        provenance: {
          createdAt: timestamp,
          lastUpdatedAt: timestamp
        },
        confidence: 0.95
      }];
    }
    return [];
  }

  /**
   * Promotes a pattern stability stage (e.g. EXPERIMENTAL -> CANDIDATE -> ACTIVE).
   */
  public static promote(patternId: string): void {
    const patterns = this.load();
    const index = patterns.findIndex(p => p.id === patternId);

    if (index !== -1) {
      const p = patterns[index];
      let nextStability: 'EXPERIMENTAL' | 'CANDIDATE' | 'ACTIVE' | 'DEPRECATED' = p.stability;

      if (p.stability === 'EXPERIMENTAL') nextStability = 'CANDIDATE';
      else if (p.stability === 'CANDIDATE') nextStability = 'ACTIVE';

      patterns[index] = {
        ...p,
        stability: nextStability,
        provenance: {
          ...p.provenance,
          validatedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString()
        }
      };

      console.log(`[ArchitecturePatternEngine] Promoted pattern "${p.id}" stability to "${nextStability}".`);
      this.save(patterns);
    }
  }
}
