/**
 * ResultAdapter.ts
 * 
 * Generic interface for Result Translation layer.
 */
export interface ResultAdapter<TInput, TOutput> {
  /**
   * Evaluates if this adapter can translate the given input result.
   */
  supports(result: TInput): boolean;

  /**
   * Deterministically converts the input result into the output contract.
   * Does NOT perform Side Effects or Business Logic.
   */
  convert(result: TInput): TOutput;
}
