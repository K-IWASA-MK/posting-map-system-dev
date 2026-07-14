import { ITrustScoreCalculator } from './interfaces';
import { TrustEvidence } from './models';

export class DefaultTrustScoreCalculator implements ITrustScoreCalculator {
  calculate(evidence: TrustEvidence): number {
    let score = 0;
    
    // Base Identity (30 pts)
    if (evidence.checksumMatches === true) {
      score += 30;
    }
    
    // Cryptographic Authenticity (40 pts)
    if (evidence.signatureValid === true) {
      score += 40;
    }
    
    // Publisher Certification (30 pts)
    // Must be valid, not expired, and not revoked
    if (evidence.certificateValid === true && 
        evidence.certificateNotExpired !== false && 
        evidence.certificateNotRevoked !== false) {
      score += 30;
    }

    return score;
  }
}
