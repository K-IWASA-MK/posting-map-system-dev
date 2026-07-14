import { Rule, RuleEvaluation } from '../../models/evaluation';
import { ProtocolContext } from './RequiredFieldRule';

const SUPPORTED_MAJOR_VERSION = '1';

/**
 * V1002: Unsupported Schema Version
 * Checks if the event's schemaVersion starts with the supported major version.
 */
export const SchemaVersionRule: Rule<ProtocolContext> = {
  id: 'schema-version-rule',
  match(input: ProtocolContext): RuleEvaluation {
    const { event } = input;
    
    // If undefined, it will be caught by RequiredFieldRule, so we ignore here
    if (!event.schemaVersion) {
      return { matched: false, ruleId: 'schema-version-rule' };
    }

    const majorVersion = event.schemaVersion.split('.')[0];
    if (majorVersion !== SUPPORTED_MAJOR_VERSION) {
      return { matched: true, ruleId: 'schema-version-rule', code: 'V1002' };
    }

    return { matched: false, ruleId: 'schema-version-rule' };
  }
};
