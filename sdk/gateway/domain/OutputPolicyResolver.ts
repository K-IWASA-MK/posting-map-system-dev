/**
 * OutputPolicyResolver.ts
 * 
 * AIOS Task Gateway Output Policy Resolver
 * Enforces Japanese as standard output language with English allowed for technical elements.
 */

import { OutputPolicy } from '../models/OutputPolicyModels';

export class OutputPolicyResolver {
  private static readonly STANDARD_POLICY: OutputPolicy = Object.freeze({
    primaryLanguage: 'JA',
    allowEnglishTechnicalTerms: true,
    rules: Object.freeze([
      'すべてのAIOS成果物は原則として日本語で出力する。',
      'ソースコード、変数・関数等の識別子、API仕様、ファイルパス、技術メトリクスなどの技術要素のみ英語表記を許可する。',
      'ドキュメント、コミットメッセージ概要、ウォークスルー、解説本文は日本語を標準とする。'
    ]),
    specificationVersion: '1.0.0'
  });

  /**
   * Deterministically resolves the AIOS Output Policy.
   * Stateless & Side-Effect Free.
   */
  public static resolvePolicy(): OutputPolicy {
    return OutputPolicyResolver.STANDARD_POLICY;
  }
}
