import { GovernancePolicyDefinition } from "./GovernancePolicyDefinition";
import { GovernancePolicyContext } from "./GovernancePolicyContext";

export interface IGovernancePolicyEngine {
  register(definition: GovernancePolicyDefinition, context: GovernancePolicyContext): Promise<boolean>;
  resolve(id: string, context: GovernancePolicyContext): Promise<GovernancePolicyDefinition | null>;
  list(context: GovernancePolicyContext): Promise<GovernancePolicyDefinition[]>;
}

export abstract class BaseGovernancePolicyEngine implements IGovernancePolicyEngine {
  abstract register(definition: GovernancePolicyDefinition, context: GovernancePolicyContext): Promise<boolean>;
  abstract resolve(id: string, context: GovernancePolicyContext): Promise<GovernancePolicyDefinition | null>;
  abstract list(context: GovernancePolicyContext): Promise<GovernancePolicyDefinition[]>;
}
