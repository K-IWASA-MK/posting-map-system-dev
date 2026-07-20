import * as fs from 'fs';
import * as path from 'path';
import { ArchitectureKnowledge } from './ArchitectureKnowledge';

export class ArchitectureKnowledgeEngine {
  private static get dbPath(): string {
    return path.resolve(__dirname, 'architecture_knowledge_base.json');
  }

  /**
   * Loads the current list of architecture knowledges from the database.
   */
  public static load(): ArchitectureKnowledge[] {
    if (!fs.existsSync(this.dbPath)) {
      return [];
    }
    try {
      const content = fs.readFileSync(this.dbPath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error(`[ArchitectureKnowledgeEngine] Failed to read knowledge base: ${err}`);
      return [];
    }
  }

  /**
   * Saves the list of architecture knowledges to the database.
   */
  public static save(knowledges: ArchitectureKnowledge[]): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(knowledges, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[ArchitectureKnowledgeEngine] Failed to save knowledge base: ${err}`);
    }
  }

  /**
   * Queries the database for any matching patterns based on the proposed files and task context.
   */
  public static query(proposedFiles: string[], taskTitle: string): { knowledge: ArchitectureKnowledge; confidence: number }[] {
    const matched: { knowledge: ArchitectureKnowledge; confidence: number }[] = [];
    const workspaceRoot = path.resolve(__dirname, '../..');
    const knowledges = this.load();

    for (const k of knowledges) {
      if (k.validationStatus !== 'ACTIVE') {
        continue;
      }

      let patternMatch = false;

      // Simple glob/substring matching on relative proposed file paths
      for (const file of proposedFiles) {
        const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');
        
        // If the pattern is found in the relative file path, it's a match
        if (k.pattern && relativePath.includes(k.pattern)) {
          patternMatch = true;
          break;
        }
      }

      if (patternMatch) {
        // We calculate contextual match confidence
        // If task title also matches context keywords, confidence is boosted to 100%, else base confidence
        const contextKeywords = k.context.toLowerCase().split(/\s+/);
        const titleLower = taskTitle.toLowerCase();
        const hasContextMatch = contextKeywords.some(kw => kw.length > 2 && titleLower.includes(kw));

        const finalConfidence = hasContextMatch ? 1.0 : k.confidence;

        matched.push({
          knowledge: k,
          confidence: finalConfidence
        });
      }
    }

    return matched;
  }

  /**
   * Promotes a new experience entry to the active knowledge base.
   * Ensures only validated, successful solutions are added.
   */
  public static promote(entry: Omit<ArchitectureKnowledge, 'timestamp' | 'promotionCount' | 'lastValidated' | 'validationStatus'>): void {
    const knowledges = this.load();
    const timestamp = new Date().toISOString();

    const newKnowledge: ArchitectureKnowledge = {
      ...entry,
      promotionCount: 1,
      lastValidated: timestamp,
      validationStatus: 'ACTIVE',
      timestamp
    };

    // Prevent duplicates by ID
    const index = knowledges.findIndex(k => k.id === entry.id);
    if (index !== -1) {
      // If it exists, update it and increment validation count
      const existing = knowledges[index];
      knowledges[index] = {
        ...newKnowledge,
        promotionCount: existing.promotionCount + 1,
        validationStatus: existing.validationStatus
      };
      console.log(`[ArchitectureKnowledgeEngine] Updated existing knowledge "${entry.title}" (Promotion Count: ${existing.promotionCount + 1}).`);
    } else {
      knowledges.push(newKnowledge);
      console.log(`[ArchitectureKnowledgeEngine] Promoted new knowledge "${entry.title}" to database.`);
    }

    this.save(knowledges);
  }
}
