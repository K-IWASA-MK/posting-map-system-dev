import { AccuracyEvidence } from '../schema/AccuracySchema';
import { AdminMatchResult } from '../validators/AdministrativeBoundaryValidator';
import { PostalMatchResult } from '../validators/PostalAddressValidator';
import { DifferenceAnalysisResult } from '../analyzer/RecordDifferenceAnalyzer';

export class AccuracyReportGenerator {
  public generate(
    districtId: string,
    inputHashes: { admin: string; postal: string; csv: string },
    outputHash: string,
    totalRecords: number,
    adminResult: AdminMatchResult,
    postalResult: PostalMatchResult,
    diffResult: DifferenceAnalysisResult
  ): AccuracyEvidence {
    const isPass =
      adminResult.matchRate === 100 &&
      postalResult.mismatchCount === 0 &&
      diffResult.isZeroDifference;

    return {
      pipeline: 'DataAccuracyVerificationFoundation',
      district: districtId,
      inputHashes,
      outputHash,
      recordCount: totalRecords,
      administrativeMatchRate: adminResult.matchRate,
      postalMatchRate: postalResult.matchRate,
      missingCount: diffResult.missingCount,
      extraCount: diffResult.extraCount,
      postalMismatchCount: postalResult.mismatchCount,
      accuracyStatus: isPass ? 'PASS' : 'FAIL',
      lifecycleStatus: 'AUDITED',
      verifiedAt: new Date().toISOString().split('T')[0],
      verifiedBy: 'AccuracyValidationAgent',
      auditedBy: 'AuditAgent',
      details: {
        missingRecords: diffResult.missingRecords,
        extraRecords: diffResult.extraRecords,
        postalMismatches: postalResult.mismatchedRecords
      }
    };
  }
}
