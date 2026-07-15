import { ProtocolContext, RequiredFieldRule } from '../../rules/protocol/RequiredFieldRule';
import { SchemaVersionRule } from '../../rules/protocol/SchemaVersionRule';
import { UriFormatRule } from '../../rules/protocol/UriFormatRule';
import { TimestampFormatRule } from '../../rules/protocol/TimestampFormatRule';
import { UnknownEventTypeRule } from '../../rules/protocol/UnknownEventTypeRule';
import { DuplicateEventRule } from '../../rules/protocol/DuplicateEventRule';

describe('Layer 1: Rule Unit Tests', () => {
  
  const createValidEvent = (): ProtocolContext => ({
    event: {
      eventId: 'evt_123',
      traceId: 'trc_456',
      source: 'urn:system:test',
      subject: 'urn:entity:user:1',
      type: 'CREATED',
      schemaVersion: '1.0.0',
      occurredAt: new Date().toISOString()
    },
    knownEventIds: new Set<string>()
  });

  describe('CT-005: No Side Effects', () => {
    it('should not mutate the input event during evaluation', () => {
      const input = createValidEvent();
      const inputCopy = JSON.parse(JSON.stringify(input.event));
      
      RequiredFieldRule.match(input);
      SchemaVersionRule.match(input);
      
      expect(input.event).toEqual(inputCopy);
    });
  });

  describe('RequiredFieldRule (V1001)', () => {
    it('returns matched=false for valid event', () => {
      const result = RequiredFieldRule.match(createValidEvent());
      expect(result.matched).toBe(false);
      expect(result.ruleId).toBe('required-field-rule');
    });

    it('returns matched=true and V1001 for missing required field', () => {
      const input = createValidEvent();
      delete input.event.eventId;
      const result = RequiredFieldRule.match(input);
      expect(result).toEqual({ matched: true, ruleId: 'required-field-rule', code: 'V1001' });
    });
  });

  describe('SchemaVersionRule (V1002)', () => {
    it('returns matched=false for supported major version 1.x', () => {
      const result = SchemaVersionRule.match(createValidEvent());
      expect(result.matched).toBe(false);
    });

    it('returns matched=true and V1002 for unsupported major version', () => {
      const input = createValidEvent();
      input.event.schemaVersion = '2.0.0';
      const result = SchemaVersionRule.match(input);
      expect(result).toEqual({ matched: true, ruleId: 'schema-version-rule', code: 'V1002' });
    });
  });

  describe('UriFormatRule (V2001)', () => {
    it('returns matched=false for valid URIs', () => {
      const result = UriFormatRule.match(createValidEvent());
      expect(result.matched).toBe(false);
    });

    it('returns matched=true and V2001 for invalid URI', () => {
      const input = createValidEvent();
      input.event.source = 'invalid-uri-not-a-urn';
      const result = UriFormatRule.match(input);
      expect(result).toEqual({ matched: true, ruleId: 'uri-format-rule', code: 'V2001' });
    });
  });

  describe('TimestampFormatRule (V3001)', () => {
    it('returns matched=false for valid ISO8601 timestamp', () => {
      const result = TimestampFormatRule.match(createValidEvent());
      expect(result.matched).toBe(false);
    });

    it('returns matched=true and V3001 for invalid timestamp', () => {
      const input = createValidEvent();
      input.event.occurredAt = 'invalid-date';
      const result = TimestampFormatRule.match(input);
      expect(result).toEqual({ matched: true, ruleId: 'timestamp-format-rule', code: 'V3001' });
    });
  });

  describe('UnknownEventTypeRule (V3002)', () => {
    it('returns matched=false for known OS event types', () => {
      const result = UnknownEventTypeRule.match(createValidEvent());
      expect(result.matched).toBe(false);
    });

    it('returns matched=true and V3002 for unknown event type', () => {
      const input = createValidEvent();
      input.event.type = 'UNKNOWN_VERB';
      const result = UnknownEventTypeRule.match(input);
      expect(result).toEqual({ matched: true, ruleId: 'unknown-event-type-rule', code: 'V3002' });
    });
  });

  describe('DuplicateEventRule (V5001)', () => {
    it('returns matched=false for unobserved eventId', () => {
      const result = DuplicateEventRule.match(createValidEvent());
      expect(result.matched).toBe(false);
    });

    it('returns matched=true and V5001 for previously seen eventId', () => {
      const input = createValidEvent();
      const knownIds = new Set(['evt_123']);
      const result = DuplicateEventRule.match({ ...input, knownEventIds: knownIds });
      expect(result).toEqual({ matched: true, ruleId: 'duplicate-event-rule', code: 'V5001' });
    });
  });
});
