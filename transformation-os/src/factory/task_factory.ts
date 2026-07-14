import { GoalDefinition } from '../models/goal';
import { TransformationContract } from '../contracts/transformation_contract';
import { ExecutionUnit } from '../models/execution_unit';
import { GoalValidator } from '../validators/goal_validator';
import { ContractValidator } from '../validators/contract_validator';
import { RequirementMapper } from './requirement_mapper';

export class TaskFactory {
  /**
   * Generates ExecutionUnits from a GoalDefinition and TransformationContract.
   * Purely deterministic. No LLM dependency.
   */
  public static generate(goal: GoalDefinition, contract: TransformationContract): ExecutionUnit[] {
    // 1. Validation Phase
    GoalValidator.validate(goal);
    ContractValidator.validate(contract);

    // 2. Mapping Phase (1:1 Generation)
    const executionUnits: ExecutionUnit[] = [];
    for (const requirement of contract.requirements) {
      const eu = RequirementMapper.map(contract.id, requirement);
      executionUnits.push(eu);
    }

    return executionUnits;
  }
}
