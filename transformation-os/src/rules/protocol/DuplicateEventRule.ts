import { Rule, RuleEvaluation } from '../../models/evaluation';
import { ProtocolContext } from './RequiredFieldRule';

/**
 * V5001: Duplicate EventId
 * Validates idempotency by checking if the eventId has already been processed.
 */
export const DuplicateEventRule: Rule<ProtocolContext> = {
  id: 'duplicate-event-rule',
  match(input: ProtocolContext): RuleEvaluation {
    const { event, knownEventIds } = input;

    if (!event.eventId || !knownEventIds) {
      return { matched: false, ruleId: 'duplicate-event-rule' };
    }

    if (knownEventIds.has(event.eventId)) {
      return { matched: true, ruleId: 'duplicate-event-rule', code: 'V5001' };
    }

    return { matched: false, ruleId: 'duplicate-event-rule' };
  }
};
