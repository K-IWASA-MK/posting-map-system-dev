export type AreaLifecycleStatus =
  | 'GENERATED'
  | 'VALIDATED'
  | 'ACCURACY_CHECKED'
  | 'AUDITED'
  | 'CEO_APPROVED'
  | 'FROZEN';

export interface AccuracyEvidence {
  pipeline: 'DataAccuracyVerificationFoundation';
  district: string;
  inputHashes: {
    admin: string;
    postal: string;
    csv: string;
  };
  outputHash: string;
  recordCount: number;
  administrativeMatchRate: number;
  postalMatchRate: number;
  missingCount: number;
  extraCount: number;
  postalMismatchCount: number;
  accuracyStatus: 'PASS' | 'FAIL';
  lifecycleStatus: AreaLifecycleStatus;
  verifiedAt: string;
  verifiedBy: 'AccuracyValidationAgent';
  auditedBy: 'AuditAgent';
  details?: {
    missingRecords: string[];
    extraRecords: string[];
    postalMismatches: string[];
  };
}
