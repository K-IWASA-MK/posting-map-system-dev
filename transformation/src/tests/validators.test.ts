import { GoalValidator } from '../validators/goal_validator';
import { ContractValidator } from '../validators/contract_validator';
import { RequirementValidator } from '../validators/requirement_validator';
import { GoalDefinition, Priority, RiskLevel } from '../models/goal';
import { TransformationContract, ContractRequirement } from '../contracts/transformation_contract';
import { RequirementType, EvidenceType } from '../language/types';

describe('Validators', () => {
  const validGoal: GoalDefinition = {
    id: 'G1',
    name: 'Goal 1',
    priority: Priority.HIGH,
    deadline: '2026-12-31',
    target: 'System A',
    successMetrics: ['Metric 1'],
    scope: [],
    excluded: [],
    risk: RiskLevel.LOW,
    costLimit: '0'
  };

  const validRequirement: ContractRequirement = {
    id: 'R1',
    type: RequirementType.REQUIRED,
    description: 'Do something',
    evidenceTypes: [EvidenceType.TEST]
  };

  const validContract: TransformationContract = {
    id: 'C1',
    goalId: 'G1',
    requirements: [validRequirement]
  };

  describe('GoalValidator', () => {
    it('should pass valid goal', () => {
      expect(() => GoalValidator.validate(validGoal)).not.toThrow();
    });

    it('should throw on missing name', () => {
      const invalid = { ...validGoal, name: '' };
      expect(() => GoalValidator.validate(invalid)).toThrow();
    });
  });

  describe('RequirementValidator', () => {
    it('should pass valid requirement', () => {
      expect(() => RequirementValidator.validate(validRequirement)).not.toThrow();
    });

    it('should throw on REQUIRED without evidence', () => {
      const invalid = { ...validRequirement, evidenceTypes: [] };
      expect(() => RequirementValidator.validate(invalid)).toThrow('REQUIRED requirement must specify at least one evidenceType.');
    });
  });

  describe('ContractValidator', () => {
    it('should pass valid contract', () => {
      expect(() => ContractValidator.validate(validContract)).not.toThrow();
    });

    it('should throw on empty contract', () => {
      const invalid = { ...validContract, requirements: [] };
      expect(() => ContractValidator.validate(invalid)).toThrow('Empty Contract');
    });

    it('should throw on duplicate requirements', () => {
      const invalid = { ...validContract, requirements: [validRequirement, validRequirement] };
      expect(() => ContractValidator.validate(invalid)).toThrow('Duplicate Requirement ID');
    });
  });
});
