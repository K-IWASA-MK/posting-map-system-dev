import { TransformationContract } from '../contracts/transformation_contract';
import { RequirementValidator } from './requirement_validator';

export class ContractValidator {
  public static validate(contract: TransformationContract): void {
    if (!contract.id || !contract.goalId) {
      throw new Error('Contract is missing id or goalId.');
    }
    if (!contract.requirements || contract.requirements.length === 0) {
      throw new Error('Contract must have at least one requirement (Empty Contract).');
    }

    const seenIds = new Set<string>();
    for (const req of contract.requirements) {
      if (seenIds.has(req.id)) {
        throw new Error(`Duplicate Requirement ID found: ${req.id}`);
      }
      seenIds.add(req.id);
      RequirementValidator.validate(req);
    }
  }
}
