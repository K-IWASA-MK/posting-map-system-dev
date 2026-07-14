import { Action, DiagnosticCode } from '../models/evaluation';

/**
 * Diagnostic Catalog
 * 
 * The Single Source of Truth for resolving DiagnosticCodes into Actions.
 * In a real OS, this might be loaded dynamically, but for the Foundation,
 * it is a static dictionary mapping symptoms to system-level actions.
 */
export const DiagnosticCatalog: Record<DiagnosticCode, Action> = {
  // 1000 Series: Schema & Structure Violations
  'V1001': 'REJECT', // Missing Required Field
  'V1002': 'REJECT', // Unsupported Schema Version

  // 2000 Series: URI / Resource Violations
  'V2001': 'REJECT', // Invalid URI

  // 3000 Series: Value & Formatting Violations
  'V3001': 'REJECT', // Invalid Timestamp
  'V3002': 'IGNORE', // Unknown Event Type (often we can just safely ignore unknown verbs)

  // 5000 Series: Idempotency & Sequencing
  'V5001': 'IGNORE', // Duplicate Event (already processed, safe to ignore)
};

/**
 * Resolves an array of DiagnosticCodes into a single highest-priority Action.
 * 
 * Priority: PANIC > ESCALATE > QUARANTINE > REJECT > RETRY > IGNORE
 */
export const resolveActionPriority = (codes: readonly DiagnosticCode[]): Action | 'PROCEED' => {
  if (codes.length === 0) return 'PROCEED';

  const actions = codes.map(code => DiagnosticCatalog[code] ?? 'ESCALATE'); // Default unknown codes to ESCALATE

  if (actions.includes('PANIC')) return 'PANIC';
  if (actions.includes('ESCALATE')) return 'ESCALATE';
  if (actions.includes('QUARANTINE')) return 'QUARANTINE';
  if (actions.includes('REJECT')) return 'REJECT';
  if (actions.includes('RETRY')) return 'RETRY';
  if (actions.includes('IGNORE')) return 'IGNORE';

  return 'PROCEED';
};
