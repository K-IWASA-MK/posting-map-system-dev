/**
 * IntentClassifier.ts
 * 
 * AIOS Task Gateway Intent Classifier
 * Deterministic, stateless classification of CEO decision input into explicit TaskIntents.
 */

import { TaskIntent } from '../models/TaskGatewayModels';

export class IntentClassifier {
  /**
   * Deterministically classifies CEO input text and metadata into a valid TaskIntent.
   * Stateless & Side-Effect Free.
   */
  public static classify(ceoInput: string, metadata?: Record<string, any>): TaskIntent {
    // 1. Explicit metadata override check
    if (metadata && typeof metadata.intent === 'string') {
      const explicitIntent = metadata.intent.toUpperCase() as TaskIntent;
      if (IntentClassifier.isValidIntent(explicitIntent)) {
        return explicitIntent;
      }
    }

    const lowerInput = ceoInput.toLowerCase();

    // 2. Hotfix detection
    if (
      lowerInput.includes('hotfix') ||
      lowerInput.includes('bugfix') ||
      lowerInput.includes('緊急') ||
      lowerInput.includes('障害') ||
      lowerInput.includes('バグ修正')
    ) {
      return 'HOTFIX';
    }

    // 3. Question detection
    if (
      lowerInput.includes('question') ||
      lowerInput.includes('質問') ||
      lowerInput.includes('とは') ||
      lowerInput.includes('教えて')
    ) {
      return 'QUESTION';
    }

    // 4. Audit detection
    if (
      lowerInput.includes('audit') ||
      lowerInput.includes('監査') ||
      lowerInput.includes('コンプライアンス') ||
      lowerInput.includes('セキュリティ検証')
    ) {
      return 'AUDIT';
    }

    // 5. Review detection
    if (
      lowerInput.includes('review') ||
      lowerInput.includes('レビュー') ||
      lowerInput.includes('検収') ||
      lowerInput.includes('査読')
    ) {
      return 'REVIEW';
    }

    // 6. Research detection
    if (
      lowerInput.includes('research') ||
      lowerInput.includes('調査') ||
      lowerInput.includes('分析') ||
      lowerInput.includes('リサーチ')
    ) {
      return 'RESEARCH';
    }

    // 7. Planning detection
    if (
      lowerInput.includes('plan') ||
      lowerInput.includes('計画') ||
      lowerInput.includes('ロードマップ') ||
      lowerInput.includes('スケジュール')
    ) {
      return 'PLANNING';
    }

    // 8. Design detection
    if (
      lowerInput.includes('design') ||
      lowerInput.includes('設計') ||
      lowerInput.includes('アーキテクチャ')
    ) {
      return 'DESIGN';
    }

    // Default implementation intent for work instructions
    return 'IMPLEMENTATION';
  }

  private static isValidIntent(intent: string): intent is TaskIntent {
    const validIntents: TaskIntent[] = [
      'QUESTION',
      'PLANNING',
      'DESIGN',
      'IMPLEMENTATION',
      'REVIEW',
      'AUDIT',
      'RESEARCH',
      'HOTFIX'
    ];
    return validIntents.includes(intent as TaskIntent);
  }
}
