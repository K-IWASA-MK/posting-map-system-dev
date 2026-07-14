import { Rule, RuleEvaluation } from '../../models/evaluation';
import { ProtocolContext } from './RequiredFieldRule';

// Known event types across the OS
const KNOWN_EVENT_TYPES = new Set([
  'CREATED',
  'QUEUED',
  'DISPATCHED',
  'ACKNOWLEDGED',
  'COMPLETED',
  'FINISHED',
  'EXPIRED',
  'DEAD',
  'FAILED'
]);

/**
 * V3002: Unknown Event Type
 * Validates that the event type is a known OS-level verb.
 */
export const UnknownEventTypeRule: Rule<ProtocolContext> = {
  id: 'unknown-event-type-rule',
  match(input: ProtocolContext): RuleEvaluation {
    const { event } = input;

    if (!event.type) {
      return { matched: false, ruleId: 'unknown-event-type-rule' }; // Caught by required rule
    }

    if (!KNOWN_EVENT_TYPES.has(event.type.toUpperCase())) {
      return { matched: true, ruleId: 'unknown-event-type-rule', code: 'V3002' };
    }

    return { matched: false, ruleId: 'unknown-event-type-rule' };
  }
};
