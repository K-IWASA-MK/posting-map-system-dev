import { RequirementMapper } from '../factory/requirement_mapper';
import { ContractRequirement } from '../contracts/transformation_contract';
import { RequirementType, EvidenceType } from '../language/types';

describe('RequirementMapper', () => {
  it('should map 1:1 correctly', () => {
    const req: ContractRequirement = {
      id: 'R10',
      type: RequirementType.REQUIRED,
      description: 'build UI button',
      evidenceTypes: [EvidenceType.TEST]
    };
    const eu = RequirementMapper.map('C10', req);
    expect(eu.id).toBe('EU-C10-R10');
    expect(eu.contractId).toBe('C10');
    expect(eu.requirementId).toBe('R10');
    expect(eu.targetRequirement).toEqual(req);
    expect(eu.mappedAction).toBe('EXECUTE_REQUIRED_BUILD_UI_BUTTON');
  });
});
