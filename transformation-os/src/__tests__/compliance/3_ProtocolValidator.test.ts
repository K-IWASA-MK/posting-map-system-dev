import { EvaluationEngine } from '../../engine/EvaluationEngine';
import { ProtocolValidator } from '../../validators/ProtocolValidator';
import { ProtocolRuleSet } from '../../rules/protocol';
import { ProtocolContext } from '../../rules/protocol/RequiredFieldRule';

describe('Layer 3: Protocol Validator Tests (Executable Specification)', () => {

  const engine = new EvaluationEngine();
  const validator = new ProtocolValidator(engine, ProtocolRuleSet);

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

  describe('Contract Guarantees', () => {
    it('CT-001 Determinism: Same input yields exact same output', () => {
      const input = createValidEvent();
      const run1 = validator.validate(input);
      const run2 = validator.validate(input);
      expect(run1).toEqual(run2);
    });

    it('CT-002 Immutability: Input event remains untouched', () => {
      const input = createValidEvent();
      const inputCopy = JSON.parse(JSON.stringify(input.event));
      validator.validate(input);
      expect(input.event).toEqual(inputCopy);
    });

    it('CT-003 RuleSet Immutability: RuleSet remains untouched', () => {
      const before = ProtocolRuleSet.rules.length;
      validator.validate(createValidEvent());
      expect(ProtocolRuleSet.rules.length).toBe(before);
    });
  });

  describe('Protocol Test Cases (PT-001 ~ PT-010)', () => {

    it('PT-001: 正常イベント -> violations = []', () => {
      const result = validator.validate(createValidEvent());
      expect(result.violations).toHaveLength(0);
    });

    it('PT-002: 必須項目欠落 -> V1001', () => {
      const input = createValidEvent();
      delete input.event.traceId;
      const result = validator.validate(input);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].code).toBe('V1001');
    });

    it('PT-003: Schema Version不一致 -> V1002', () => {
      const input = createValidEvent();
      input.event.schemaVersion = '2.0.0';
      const result = validator.validate(input);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].code).toBe('V1002');
    });

    it('PT-004: URI不正 -> V2001', () => {
      const input = createValidEvent();
      input.event.source = 'invalid-uri';
      const result = validator.validate(input);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].code).toBe('V2001');
    });

    it('PT-005: Timestamp不正 -> V3001', () => {
      const input = createValidEvent();
      input.event.occurredAt = 'invalid-date';
      const result = validator.validate(input);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].code).toBe('V3001');
    });

    it('PT-006: Unknown Event -> V3002', () => {
      const input = createValidEvent();
      input.event.type = 'UNKNOWN';
      const result = validator.validate(input);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].code).toBe('V3002');
    });

    it('PT-007: Duplicate Event -> V5001', () => {
      const input = createValidEvent();
      const knownIds = new Set(['evt_123']);
      const result = validator.validate({ ...input, knownEventIds: knownIds });
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].code).toBe('V5001');
    });

    it('PT-008: V1001 + V3002 -> 両方返る', () => {
      const input = createValidEvent();
      delete input.event.eventId; // V1001
      input.event.type = 'UNKNOWN'; // V3002
      
      const result = validator.validate(input);
      expect(result.violations).toHaveLength(2);
      
      const codes = result.violations.map(v => v.code);
      expect(codes).toContain('V1001');
      expect(codes).toContain('V3002');
    });

    it('PT-009: V1001 + V2001 + V3001 -> 3件返る', () => {
      const input = createValidEvent();
      delete input.event.subject; // V1001
      input.event.source = 'invalid'; // V2001
      input.event.occurredAt = 'nope'; // V3001
      
      const result = validator.validate(input);
      expect(result.violations).toHaveLength(3);
      
      const codes = result.violations.map(v => v.code);
      expect(codes).toContain('V1001');
      expect(codes).toContain('V2001');
      expect(codes).toContain('V3001');
    });

    it('PT-010: 全Violation同時 -> 全件返る・Fail Fastしない', () => {
      const input = createValidEvent();
      delete input.event.traceId; // V1001
      input.event.schemaVersion = '9.9.9'; // V1002
      input.event.dataRef = 'invalid_uri'; // V2001
      input.event.occurredAt = 'invalid_date'; // V3001
      input.event.type = 'BAD_TYPE'; // V3002
      const duplicateInput = { ...input, knownEventIds: new Set(['evt_123']) }; // V5001
      
      const result = validator.validate(duplicateInput);
      expect(result.violations).toHaveLength(6);
      
      const codes = result.violations.map(v => v.code);
      expect(codes).toContain('V1001');
      expect(codes).toContain('V1002');
      expect(codes).toContain('V2001');
      expect(codes).toContain('V3001');
      expect(codes).toContain('V3002');
      expect(codes).toContain('V5001');
    });
  });

});
