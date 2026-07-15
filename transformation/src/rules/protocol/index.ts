import { RuleSet } from '../../models/evaluation';
import { ProtocolContext, RequiredFieldRule } from './RequiredFieldRule';
import { SchemaVersionRule } from './SchemaVersionRule';
import { UriFormatRule } from './UriFormatRule';
import { TimestampFormatRule } from './TimestampFormatRule';
import { UnknownEventTypeRule } from './UnknownEventTypeRule';
import { DuplicateEventRule } from './DuplicateEventRule';

/**
 * Protocol Rule Set
 * A collection of all base rules required to validate OS Internal Protocol compliance.
 */
export const ProtocolRuleSet: RuleSet<ProtocolContext> = {
  id: 'protocol-rules',
  version: '1.0.0',
  rules: Object.freeze([
    RequiredFieldRule,
    SchemaVersionRule,
    UriFormatRule,
    TimestampFormatRule,
    UnknownEventTypeRule,
    DuplicateEventRule
  ])
};
