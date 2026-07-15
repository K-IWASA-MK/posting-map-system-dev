import { ILogicalRule } from '../contracts';

export class LogicalRuleBuilder {
  private readonly parameters = new Map<string, unknown>();

  public static create(ruleId: string, ruleType: string, pluginId: string): LogicalRuleBuilder {
    return new LogicalRuleBuilder(ruleId, ruleType, pluginId);
  }

  private constructor(
    private readonly ruleId: string,
    private readonly ruleType: string,
    private readonly pluginId: string
  ) {}

  public parameter(key: string, value: unknown): this {
    this.parameters.set(key, value);
    return this;
  }

  public build(): ILogicalRule {
    const paramsObj: Record<string, unknown> = {};
    this.parameters.forEach((v, k) => {
      paramsObj[k] = typeof v === 'object' && v !== null ? Object.freeze(v) : v;
    });

    return Object.freeze({
      ruleId: this.ruleId,
      ruleType: this.ruleType,
      pluginId: this.pluginId,
      parameters: Object.freeze(paramsObj)
    });
  }
}
