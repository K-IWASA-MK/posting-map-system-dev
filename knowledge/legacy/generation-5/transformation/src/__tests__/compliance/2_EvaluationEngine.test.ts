import { EvaluationEngine } from '../../engine/EvaluationEngine';
import { Rule, RuleEvaluation, RuleSet } from '../../models/evaluation';

describe('Layer 2: Evaluation Engine Tests', () => {

  const mockRule1: Rule<any> = {
    id: 'mock-rule-1',
    match: jest.fn().mockReturnValue({ matched: true, ruleId: 'mock-rule-1', code: 'MOCK1' })
  };

  const mockRule2: Rule<any> = {
    id: 'mock-rule-2',
    match: jest.fn().mockReturnValue({ matched: false, ruleId: 'mock-rule-2' })
  };

  const mockRule3: Rule<any> = {
    id: 'mock-rule-3',
    match: jest.fn().mockReturnValue({ matched: true, ruleId: 'mock-rule-3', code: 'MOCK3' })
  };

  const testRuleSet: RuleSet<any> = {
    id: 'test-ruleset',
    version: '1.0.0',
    rules: [mockRule1, mockRule2, mockRule3]
  };

  let engine: EvaluationEngine;

  beforeEach(() => {
    engine = new EvaluationEngine();
    jest.clearAllMocks();
  });

  describe('CT-004: Rule Execution Order', () => {
    it('evaluates rules exactly in the order they are defined in the RuleSet array', () => {
      engine.evaluate({}, testRuleSet);
      
      const order1 = (mockRule1.match as jest.Mock).mock.invocationCallOrder[0];
      const order2 = (mockRule2.match as jest.Mock).mock.invocationCallOrder[0];
      const order3 = (mockRule3.match as jest.Mock).mock.invocationCallOrder[0];

      expect(order1).toBeLessThan(order2);
      expect(order2).toBeLessThan(order3);
    });
  });

  describe('Engine Spec: No Fail-Fast', () => {
    it('evaluates ALL rules even if earlier rules matched (returned violation)', () => {
      engine.evaluate({}, testRuleSet);

      // Rule1 matched, but Rule2 and Rule3 must still be called
      expect(mockRule1.match).toHaveBeenCalledTimes(1);
      expect(mockRule2.match).toHaveBeenCalledTimes(1);
      expect(mockRule3.match).toHaveBeenCalledTimes(1);
    });
  });

  describe('Engine Spec: ValidationResult', () => {
    it('returns only the matched diagnostics without modifying input or RuleSet', () => {
      const input = { data: 'test' };
      const inputCopy = JSON.parse(JSON.stringify(input));

      const result = engine.evaluate(input, testRuleSet);

      // CT-005: Input is unmodified
      expect(input).toEqual(inputCopy);

      // Only returns matched rules (1 and 3)
      expect(result.violations).toHaveLength(2);
      expect(result.violations).toEqual([
        { ruleId: 'mock-rule-1', code: 'MOCK1' },
        { ruleId: 'mock-rule-3', code: 'MOCK3' }
      ]);
    });
  });
});
