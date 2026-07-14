import { Rule, RuleEvaluation } from '../../models/evaluation';
import { OSEvent } from '../../models/protocol';

export type ProtocolContext = {
  readonly event: Partial<OSEvent>;
  readonly knownEventIds?: ReadonlySet<string>;
};

/**
 * V1001: Missing Required Field
 * Ensures all mandatory envelope fields are present.
 */
export const RequiredFieldRule: Rule<ProtocolContext> = {
  id: 'required-field-rule',
  match(input: ProtocolContext): RuleEvaluation {
    const { event } = input;
    
    const hasAllRequired = 
      typeof event.eventId === 'string' && event.eventId.trim() !== '' &&
      typeof event.traceId === 'string' && event.traceId.trim() !== '' &&
      typeof event.source === 'string' && event.source.trim() !== '' &&
      typeof event.subject === 'string' && event.subject.trim() !== '' &&
      typeof event.type === 'string' && event.type.trim() !== '' &&
      typeof event.schemaVersion === 'string' && event.schemaVersion.trim() !== '' &&
      typeof event.occurredAt === 'string' && event.occurredAt.trim() !== '';

    if (!hasAllRequired) {
      return { matched: true, ruleId: 'required-field-rule', code: 'V1001' };
    }

    return { matched: false, ruleId: 'required-field-rule' };
  }
};
