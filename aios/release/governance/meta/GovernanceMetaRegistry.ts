/**
 * GovernanceMetaRegistry.ts
 * 
 * Deployment Target Verification Gate - Meta Registry (Sprint DTVG-16)
 * AI Employee ガバナンス層全体のメタ評価レコードを保存・クエリする。
 */

import { MetaAssessmentResult } from './GovernanceMetaTypes';

export class GovernanceMetaRegistry {
  private static assessments: Map<string, MetaAssessmentResult> = new Map();

  /**
   * メタ評価結果の保存
   */
  public static saveAssessment(result: MetaAssessmentResult): void {
    this.assessments.set(result.assessmentId, Object.freeze({ ...result }));
  }

  /**
   * 全メタ評価の取得
   */
  public static getAllAssessments(): MetaAssessmentResult[] {
    return Array.from(this.assessments.values());
  }

  /**
   * 指定した AI Employee の最新メタ評価を取得
   */
  public static getLatestAssessment(employeeId: string): MetaAssessmentResult | undefined {
    const list = Array.from(this.assessments.values())
      .filter(a => a.employeeId === employeeId)
      .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());
    return list[0];
  }

  /**
   * レジストリのクリア (テスト用)
   */
  public static clear(): void {
    this.assessments.clear();
  }
}
