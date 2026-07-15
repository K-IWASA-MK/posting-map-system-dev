/**
 * PatternType is a string-based type that is intended to be used with a Registry.
 * It is NOT a hardcoded enum, allowing for future Plugin extensions.
 * Pre-defined constants (SEQUENCE, FREQUENCY, etc.) can be registered dynamically.
 */
export type PatternType = string;

/**
 * PatternStatus defines the strictly one-way lifecycle of a LearningPattern.
 * Allowed transition: DISCOVERED -> APPROVED -> DEPRECATED
 * Backward transitions are explicitly forbidden.
 */
export enum PatternStatus {
  DISCOVERED = 'DISCOVERED',
  APPROVED = 'APPROVED',
  DEPRECATED = 'DEPRECATED'
}
