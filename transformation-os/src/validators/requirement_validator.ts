import { ContractRequirement } from '../contracts/transformation_contract';
import { RequirementType } from '../language/types';

export class RequirementValidator {
  public static validate(requirement: ContractRequirement): void {
    if (!requirement.id || !requirement.type || !requirement.description) {
      throw new Error('Requirement is missing id, type, or description.');
    }
    if (!Object.values(RequirementType).includes(requirement.type)) {
      throw new Error(`Invalid RequirementType: ${requirement.type}`);
    }
    if (requirement.type === RequirementType.REQUIRED && (!requirement.evidenceTypes || requirement.evidenceTypes.length === 0)) {
      throw new Error('REQUIRED requirement must specify at least one evidenceType.');
    }
  }
}
