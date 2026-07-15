import { ContractRequirement } from '../contracts/transformation_contract';

export interface ExecutionUnit {
  readonly id: string;
  readonly contractId: string;
  readonly requirementId: string;
  readonly targetRequirement: ContractRequirement;
  readonly mappedAction: string;
}
