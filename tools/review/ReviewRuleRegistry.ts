import { ReviewRule } from './ReviewRule';

export class ReviewRuleRegistry {
  private static readonly rules = new Map<string, ReviewRule>();

  public static register(rule: ReviewRule): void {
    this.rules.set(rule.id, rule);
  }

  public static unregister(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  public static getRules(): ReviewRule[] {
    return Array.from(this.rules.values());
  }

  public static clear(): void {
    this.rules.clear();
  }

  /**
   * Discovers and registers all built-in architecture validation rules.
   */
  public static discover(): void {
    // Clear existing rules to prevent double registration
    this.clear();

    const { ProjectBoundaryRule } = require('./rules/ProjectBoundaryRule');
    const { DirectoryResponsibilityRule } = require('./rules/DirectoryResponsibilityRule');
    const { OwnershipRule } = require('./rules/OwnershipRule');
    const { ArchitecturePolicyRule } = require('./rules/ArchitecturePolicyRule');

    this.register(new ProjectBoundaryRule());
    this.register(new DirectoryResponsibilityRule());
    this.register(new OwnershipRule());
    this.register(new ArchitecturePolicyRule());
  }
}
