export enum TrustLevel {
  UNKNOWN = 'UNKNOWN',
  UNTRUSTED = 'UNTRUSTED',
  TRUSTED = 'TRUSTED',
  CERTIFIED = 'CERTIFIED',
}

export interface TrustEvidenceData {
  readonly checksumMatches?: boolean;
  readonly signatureValid?: boolean;
  readonly certificateValid?: boolean;
  readonly certificateNotExpired?: boolean;
  readonly certificateNotRevoked?: boolean;
  // Extensible for future attributes like SBOM, Vulnerability, Reputation, Transparency Log
  readonly [key: string]: any;
}

/**
 * TrustEvidence
 * 
 * Immutable aggregate of all cryptographical proofs and trust signals.
 */
export class TrustEvidence {
  constructor(private readonly data: TrustEvidenceData = {}) {}

  get checksumMatches(): boolean | undefined { return this.data.checksumMatches; }
  get signatureValid(): boolean | undefined { return this.data.signatureValid; }
  get certificateValid(): boolean | undefined { return this.data.certificateValid; }
  get certificateNotExpired(): boolean | undefined { return this.data.certificateNotExpired; }
  get certificateNotRevoked(): boolean | undefined { return this.data.certificateNotRevoked; }

  has(key: string): boolean {
    return this.data[key] !== undefined;
  }

  get(key: string): any {
    return this.data[key];
  }

  // Immutable addition of evidence (Open Closed Principle)
  with(key: string, value: any): TrustEvidence {
    return new TrustEvidence({
      ...this.data,
      [key]: value
    });
  }

  toJSON(): TrustEvidenceData {
    return { ...this.data };
  }
}

export interface TrustRequest {
  readonly pluginId: string;
  readonly version: string;
  readonly archiveData: Uint8Array;
  readonly checksumRef?: string;
  readonly signatureRef?: string;
}

export interface TrustResult {
  readonly score: number;
  readonly level: TrustLevel;
  readonly evidence: TrustEvidence;
  readonly evaluatedAt: string;
  readonly evaluatorVersion: string;
}
