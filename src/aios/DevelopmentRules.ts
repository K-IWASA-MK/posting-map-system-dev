/**
 * DevelopmentRules.ts
 * 
 * Development OS で適用される各開発ルールの定義体。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface DevelopmentRule {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly capability: string;
  readonly priority: number;
}

export class DevelopmentRules {
  /**
   * 不変な開発ルールオブジェクトを生成する
   */
  static createRule(id: string, name: string, capability: string, priority: number): DevelopmentRule {
    if (!id) {
      throw new Error('[DevelopmentRules] ruleId is required');
    }
    if (!name) {
      throw new Error('[DevelopmentRules] ruleName is required');
    }
    if (!capability) {
      throw new Error('[DevelopmentRules] capability is required');
    }

    const rule: DevelopmentRule = {
      ruleId: id,
      ruleName: name,
      capability: capability,
      priority: priority
    };

    return Object.freeze(rule);
  }
}
