export interface ILogicalRule {
  readonly ruleId: string;
  readonly ruleType: string;
  readonly pluginId: string;
  readonly parameters: Readonly<Record<string, unknown>>;
}
