import { TaskFactory } from '../factory/task_factory';
import { GoalDefinition, Priority, RiskLevel } from '../models/goal';
import { TransformationContract } from '../contracts/transformation_contract';
import { RequirementType, EvidenceType } from '../language/types';

describe('TaskFactory', () => {
  const goal: GoalDefinition = {
    id: 'G1',
    name: 'Goal 1',
    priority: Priority.HIGH,
    deadline: '2026-12-31',
    target: 'System',
    successMetrics: ['Metric'],
    scope: [],
    excluded: [],
    risk: RiskLevel.LOW,
    costLimit: '0'
  };

  const contract: TransformationContract = {
    id: 'C1',
    goalId: 'G1',
    requirements: [
      {
        id: 'R1',
        type: RequirementType.REQUIRED,
        description: 'Test 1',
        evidenceTypes: [EvidenceType.TEST]
      },
      {
        id: 'R2',
        type: RequirementType.OPTIONAL,
        description: 'Test 2',
        evidenceTypes: []
      }
    ]
  };

  it('should generate execution units 1:1 with requirements', () => {
    const eus = TaskFactory.generate(goal, contract);
    expect(eus.length).toBe(2);
    expect(eus[0].requirementId).toBe('R1');
    expect(eus[1].requirementId).toBe('R2');
  });

  it('should throw if goal is invalid', () => {
    const invalidGoal = { ...goal, name: '' };
    expect(() => TaskFactory.generate(invalidGoal, contract)).toThrow();
  });

  it('should throw if contract is empty', () => {
    const emptyContract = { ...contract, requirements: [] };
    expect(() => TaskFactory.generate(goal, emptyContract)).toThrow();
  });
});
