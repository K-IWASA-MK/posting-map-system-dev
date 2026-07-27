/**
 * DeploymentKnowledgeRegistry.ts
 * 
 * Deployment Target Verification Gate - Knowledge Base Registry (Sprint DTVG-09)
 * 抽出された過去のデプロイ事故パターン・防止策・改善推奨を保管・参照する静的不変レジストリ。
 */

import {
  FailurePattern,
  ImprovementRecommendation,
  DeploymentLearningRecord
} from './DeploymentFeedbackTypes';

export class DeploymentKnowledgeRegistry {
  private static patterns: Map<string, FailurePattern> = new Map();
  private static learningRecords: DeploymentLearningRecord[] = [];

  /**
   * 事前定義された標準事故パターンの初期化
   */
  public static initializeDefaults(): void {
    if (this.patterns.size > 0) return;

    this.registerPattern({
      patternId: 'PAT-REPO-001',
      category: 'REPOSITORY_MISMATCH',
      name: 'Repository Match Violation',
      cause: 'Requested deployment repository does not match verified git remote.',
      prevention: 'Verify git remote origin URL against requested repository before releasing.',
      targetGate: 'Gate-001'
    });

    this.registerPattern({
      patternId: 'PAT-BRANCH-002',
      category: 'BRANCH_MISMATCH',
      name: 'Target Branch Mismatch',
      cause: 'Requested release branch is different from actual checked out deployment branch.',
      prevention: 'Ensure release request specifies current active git branch.',
      targetGate: 'Gate-002'
    });

    this.registerPattern({
      patternId: 'PAT-ROOT-003',
      category: 'PUBLISH_ROOT_MISMATCH',
      name: 'Publish Root Boundary Violation',
      cause: 'Edited source asset path is outside designated publish root directory.',
      prevention: 'Verify that all edited artifacts reside inside target publish root directory.',
      targetGate: 'Gate-003'
    });

    this.registerPattern({
      patternId: 'PAT-CONFIG-004',
      category: 'RUNTIME_CONFIG_MISMATCH',
      name: 'Stale Runtime Endpoint Configuration',
      cause: 'Frontend config points to an outdated backend endpoint or old GAS Deployment ID.',
      prevention: 'Synchronize config.js gasWebAppUrl with active backend deployment registry before release.',
      targetGate: 'Gate-004'
    });

    this.registerPattern({
      patternId: 'PAT-AUTH-005',
      category: 'EMPLOYEE_AUTHORIZATION_VIOLATION',
      name: 'Unauthorized AI Employee Profile',
      cause: 'Execution profile is not set to standard AI Employee Profile or employee is inactive.',
      prevention: 'Ensure AI Employee operates exclusively under AI Employee Profile.',
      targetGate: 'Gate-005'
    });

    this.registerPattern({
      patternId: 'PAT-FINGERPRINT-007',
      category: 'FINGERPRINT_MISMATCH',
      name: 'Deployment Fingerprint Tamper/Mismatch',
      cause: 'Asset SHA256 or build configuration hash changed unexpectedly.',
      prevention: 'Re-calculate fingerprint before release request to ensure payload integrity.',
      targetGate: 'Gate-007'
    });

    this.registerPattern({
      patternId: 'PAT-SMOKE-008',
      category: 'POST_DEPLOYMENT_SMOKE_FAIL',
      name: 'Post-Deployment Smoke Verification Failure',
      cause: 'Live public endpoint returned non-200 status, stale cache, or version mismatch.',
      prevention: 'Run verifyDryRun and verify live backend health prior to final production release.',
      targetGate: 'Gate-008'
    });
  }

  /**
   * ナレッジパターンの登録
   */
  public static registerPattern(pattern: FailurePattern): void {
    this.patterns.set(pattern.patternId, Object.freeze({ ...pattern }));
  }

  /**
   * ID でナレッジパターンを取得
   */
  public static getPattern(patternId: string): FailurePattern | undefined {
    this.initializeDefaults();
    return this.patterns.get(patternId);
  }

  /**
   * カテゴリでナレッジパターンを検索
   */
  public static getPatternsByCategory(category: string): FailurePattern[] {
    this.initializeDefaults();
    return Array.from(this.patterns.values()).filter(p => p.category === category);
  }

  /**
   * 全ナレッジパターンの取得
   */
  public static getAllPatterns(): FailurePattern[] {
    this.initializeDefaults();
    return Array.from(this.patterns.values());
  }

  /**
   * 学習レコードの登録
   */
  public static recordLearning(record: DeploymentLearningRecord): void {
    this.learningRecords.push(Object.freeze({ ...record }));
  }

  /**
   * 指定した AI Employee の過去学習レコードを取得
   */
  public static getLearningHistoryForEmployee(employeeId: string): DeploymentLearningRecord[] {
    return this.learningRecords.filter(r => r.employeeId === employeeId);
  }

  /**
   * レジストリのクリア (テスト用)
   */
  public static clear(): void {
    this.patterns.clear();
    this.learningRecords = [];
  }
}
