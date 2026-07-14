import { ITrustEvidenceProvider } from './interfaces';
import { TrustRequest, TrustEvidence } from './models';

export class MockChecksumProvider implements ITrustEvidenceProvider {
  constructor(private readonly shouldMatch: boolean | null = true) {}
  
  async provide(request: TrustRequest, evidence: TrustEvidence): Promise<TrustEvidence> {
    if (this.shouldMatch === null) throw new Error("Network error fetching checksum");
    return evidence.with('checksumMatches', this.shouldMatch);
  }
}

export class MockSignatureProvider implements ITrustEvidenceProvider {
  constructor(private readonly isValid: boolean | null = true) {}
  
  async provide(request: TrustRequest, evidence: TrustEvidence): Promise<TrustEvidence> {
    if (this.isValid === null) throw new Error("Network error validating signature");
    return evidence.with('signatureValid', this.isValid);
  }
}

export class MockCertificateProvider implements ITrustEvidenceProvider {
  constructor(
    private readonly isValid: boolean | null = true,
    private readonly notExpired: boolean = true,
    private readonly notRevoked: boolean = true
  ) {}
  
  async provide(request: TrustRequest, evidence: TrustEvidence): Promise<TrustEvidence> {
    if (this.isValid === null) throw new Error("Network error contacting CA");
    return evidence
      .with('certificateValid', this.isValid)
      .with('certificateNotExpired', this.notExpired)
      .with('certificateNotRevoked', this.notRevoked);
  }
}

export class MockSBOMProvider implements ITrustEvidenceProvider {
  async provide(request: TrustRequest, evidence: TrustEvidence): Promise<TrustEvidence> {
    return evidence.with('hasSBOM', true).with('vulnerabilities', 0);
  }
}
