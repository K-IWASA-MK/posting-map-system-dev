import { RequirementType, EvidenceType } from '../language/types';

export interface ContractRequirement {
  readonly id: string;
  readonly type: RequirementType;
  readonly description: string;
  readonly evidenceTypes: readonly EvidenceType[];
}

export interface TransformationContract {
  readonly id: string;
  readonly goalId: string;
  readonly requirements: readonly ContractRequirement[];
}
