import { ContractRequirement } from '../contracts/transformation_contract';
import { ExecutionUnit } from '../models/execution_unit';

export class RequirementMapper {
  /**
   * Pure Function that maps a ContractRequirement to an ExecutionUnit 1:1.
   * No AI dependency, strictly deterministic.
   */
  public static map(contractId: string, requirement: ContractRequirement): ExecutionUnit {
    // Generate deterministic ID based on contract and requirement IDs to ensure Snapshot testing consistency
    const deterministicId = `EU-${contractId}-${requirement.id}`;
    
    return {
      id: deterministicId,
      contractId: contractId,
      requirementId: requirement.id,
      targetRequirement: requirement,
      mappedAction: `EXECUTE_${requirement.type}_${requirement.description.toUpperCase().replace(/\s+/g, '_')}`
    };
  }
}
