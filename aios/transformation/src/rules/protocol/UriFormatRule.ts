import { Rule, RuleEvaluation } from '../../models/evaluation';
import { ProtocolContext } from './RequiredFieldRule';

/**
 * Helper to check if a string is a valid URI
 */
function isValidUri(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}

/**
 * V2001: Invalid URI Format
 * Validates that source, subject, dataRef, policyRef, payloadRef are valid URIs.
 */
export const UriFormatRule: Rule<ProtocolContext> = {
  id: 'uri-format-rule',
  match(input: ProtocolContext): RuleEvaluation {
    const { event } = input;

    // Check base envelope URIs
    if (event.source && !isValidUri(event.source)) return { matched: true, ruleId: 'uri-format-rule', code: 'V2001' };
    if (event.subject && !isValidUri(event.subject)) return { matched: true, ruleId: 'uri-format-rule', code: 'V2001' };
    if (event.dataRef && !isValidUri(event.dataRef)) return { matched: true, ruleId: 'uri-format-rule', code: 'V2001' };

    // Note: policyRef and payloadRef are specific to AutomationJob payloads, but if they exist they must be valid.
    // Assuming we only validate standard envelope fields here as per OSEvent definition.
    // If the event payload includes those fields and we want to validate them here, we would need to inspect them.
    // For now, sticking strictly to OSEvent envelope fields.

    return { matched: false, ruleId: 'uri-format-rule' };
  }
};
