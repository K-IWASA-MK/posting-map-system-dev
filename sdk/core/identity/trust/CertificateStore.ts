import { Certificate, CertificateStatus } from '../IdentityModels';

export class CertificateStore {
  private certificates = new Map<string, Certificate>();
  private crl = new Set<string>(); // Revoked certificate IDs

  public issueCertificate(identityId: string, publicKey: string, expirationMs = 3600000): Certificate {
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const cert: Certificate = {
      certificateId,
      identityId,
      publicKey,
      status: 'ISSUED',
      issuedAt: Date.now(),
      expiresAt: Date.now() + expirationMs
    };
    this.certificates.set(certificateId, cert);
    return cert;
  }

  public activateCertificate(certificateId: string): void {
    const cert = this.certificates.get(certificateId);
    if (cert) {
      this.certificates.set(certificateId, {
        ...cert,
        status: 'ACTIVE'
      });
    }
  }

  public revokeCertificate(certificateId: string): void {
    const cert = this.certificates.get(certificateId);
    if (cert) {
      this.certificates.set(certificateId, {
        ...cert,
        status: 'REVOKED',
        revokedAt: Date.now()
      });
      this.crl.add(certificateId);
    }
  }

  public renewCertificate(oldCertificateId: string, newExpirationMs = 3600000): Certificate {
    const oldCert = this.certificates.get(oldCertificateId);
    if (!oldCert) {
      throw new Error(`Certificate ${oldCertificateId} not found`);
    }

    // Revoke old certificate
    this.revokeCertificate(oldCertificateId);

    // Issue new certificate
    return this.issueCertificate(oldCert.identityId, oldCert.publicKey, newExpirationMs);
  }

  public getCertificate(certificateId: string): Certificate | undefined {
    return this.certificates.get(certificateId);
  }

  public isRevoked(certificateId: string): boolean {
    return this.crl.has(certificateId);
  }

  public verifyValidity(certificateId: string): CertificateStatus {
    const cert = this.certificates.get(certificateId);
    if (!cert) return 'REVOKED';

    if (this.isRevoked(certificateId) || cert.status === 'REVOKED') {
      return 'REVOKED';
    }

    if (Date.now() > cert.expiresAt) {
      return 'EXPIRED';
    }

    return cert.status;
  }
}
