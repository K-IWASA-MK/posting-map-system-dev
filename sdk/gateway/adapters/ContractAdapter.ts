import { TaskContract } from '../models/TaskContractModels';

/**
 * ContractAdapter.ts
 * 
 * Generic interface for adapters that translate AIOS TaskContracts into 
 * destination-specific representations (e.g., Legacy DTOs).
 * 
 * Architecture Principle:
 * - Stateless
 * - Side Effect Free
 * - No Business Logic
 */
export interface ContractAdapter<TOutput> {
  /**
   * Evaluates whether this adapter can process the given TaskContract.
   */
  supports(contract: TaskContract): boolean;

  /**
   * Converts the TaskContract into the specified output representation.
   * Throws an error if required properties are missing or validation fails.
   * Performs only Adapter Validation (type checking, missing fields).
   */
  convert(contract: TaskContract): TOutput;
}
