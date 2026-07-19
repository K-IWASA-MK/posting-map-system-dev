import { LicenseRecord, LicenseState } from '../service/ServiceModels';

export class LicenseManager {
  private licenses = new Map<string, LicenseRecord>();

  public issueLicense(licenseId: string, serviceId: string, licenseeId: string, durationMs = 86400000): LicenseRecord {
    const record: LicenseRecord = {
      licenseId,
      serviceId,
      licenseeId,
      status: 'ISSUED',
      expiresAt: Date.now() + durationMs
    };
    this.licenses.set(licenseId, record);
    return record;
  }

  public getLicense(licenseId: string): LicenseRecord | undefined {
    return this.licenses.get(licenseId);
  }

  public getLicenseForLicensee(serviceId: string, licenseeId: string): LicenseRecord | undefined {
    return Array.from(this.licenses.values()).find(
      l => l.serviceId === serviceId && l.licenseeId === licenseeId
    );
  }

  public updateLicenseStatus(licenseId: string, status: LicenseState): void {
    const l = this.licenses.get(licenseId);
    if (l) {
      this.licenses.set(licenseId, {
        ...l,
        status
      });
    }
  }

  public getAll(): LicenseRecord[] {
    return Array.from(this.licenses.values());
  }
}
