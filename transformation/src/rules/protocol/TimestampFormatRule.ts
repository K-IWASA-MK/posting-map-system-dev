import { Rule, RuleEvaluation } from '../../models/evaluation';
import { ProtocolContext } from './RequiredFieldRule';

/**
 * V3001: Invalid Timestamp Format
 * Validates that occurredAt is a valid ISO8601 string.
 */
export const TimestampFormatRule: Rule<ProtocolContext> = {
  id: 'timestamp-format-rule',
  match(input: ProtocolContext): RuleEvaluation {
    const { event } = input;

    if (!event.occurredAt) {
      return { matched: false, ruleId: 'timestamp-format-rule' }; // Caught by required rule
    }

    const parsed = Date.parse(event.occurredAt);
    if (isNaN(parsed)) {
      return { matched: true, ruleId: 'timestamp-format-rule', code: 'V3001' };
    }

    return { matched: false, ruleId: 'timestamp-format-rule' };
  }
};
