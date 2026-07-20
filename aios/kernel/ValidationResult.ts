export interface ValidationError {
  readonly code: string;    // e.g., "MISSING_REQUIRED", "INVALID_TYPE", "VALUE_MISMATCH", "PATTERN_MISMATCH"
  readonly field: string;   // e.g., "protocolId", "signatures.0.signer"
  readonly message: string; // Explanatory description
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly protocolId: string;
  readonly protocolVersion: string;
  readonly errors: readonly ValidationError[];
}
