import { TaskFactory } from '../factory/task_factory';
import { GoalDefinition, Priority, RiskLevel } from '../models/goal';
import { TransformationContract } from '../contracts/transformation_contract';
import { RequirementType, EvidenceType } from '../language/types';

describe('Snapshot Determinism Test', () => {
  const goal: GoalDefinition = {
    id: 'G_SNAP',
    name: 'Snapshot Goal',
    priority: Priority.CRITICAL,
    deadline: '2026-12-31',
    target: 'System A',
    successMetrics: ['Success'],
    scope: ['All'],
    excluded: ['None'],
    risk: RiskLevel.HIGH,
    costLimit: '1000'
  };

  const contract: TransformationContract = {
    id: 'C_SNAP',
    goalId: 'G_SNAP',
    requirements: [
      { id: 'REQ_1', type: RequirementType.REQUIRED, description: 'Fix UI', evidenceTypes: [EvidenceType.TEST] },
      { id: 'REQ_2', type: RequirementType.OPTIONAL, description: 'Add Log', evidenceTypes: [] }
    ]
  };

  it('should generate identical Output across 100 iterations (Determinism Audit)', () => {
    const firstOutput = TaskFactory.generate(goal, contract);
    const firstOutputStr = JSON.stringify(firstOutput);

    for (let i = 0; i < 100; i++) {
      const output = TaskFactory.generate(goal, contract);
      expect(JSON.stringify(output)).toBe(firstOutputStr);
    }
    
    // Also use jest's built-in snapshot
    expect(firstOutput).toMatchSnapshot();
  });
});
