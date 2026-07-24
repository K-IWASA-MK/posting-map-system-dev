import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AccuracyEvidence } from '../schema/AccuracySchema';
import { AdministrativeBoundaryValidator } from '../validators/AdministrativeBoundaryValidator';
import { PostalAddressValidator } from '../validators/PostalAddressValidator';
import { RecordDifferenceAnalyzer } from '../analyzer/RecordDifferenceAnalyzer';
import { AccuracyReportGenerator } from '../reporter/AccuracyReportGenerator';

export class AccuracyVerificationPipeline {
  private adminValidator: AdministrativeBoundaryValidator;
  private postalValidator: PostalAddressValidator;
  private diffAnalyzer: RecordDifferenceAnalyzer;
  private reportGenerator: AccuracyReportGenerator;

  constructor() {
    this.adminValidator = new AdministrativeBoundaryValidator();
    this.postalValidator = new PostalAddressValidator();
    this.diffAnalyzer = new RecordDifferenceAnalyzer();
    this.reportGenerator = new AccuracyReportGenerator();
  }

  public runVerification(csvPath: string, expectedCount: number = 651): AccuracyEvidence {
    if (!fs.existsSync(csvPath)) {
      throw new Error(`[AccuracyVerificationPipeline] CSV file not found: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    const header = lines[0].split(',');

    const records = lines.slice(1).map(line => {
      const vals = line.split(',');
      const obj: any = {};
      header.forEach((h, i) => {
        obj[h] = vals[i] || '';
      });
      return obj;
    });

    const outputHash = crypto.createHash('sha256').update(csvContent).digest('hex');

    // Source Hashes
    const refDir = path.join(__dirname, '../../../../projects/posting-map/reference');
    const adminPath = path.join(refDir, '三重県選挙区区割り.csv');
    const postalPath = path.join(refDir, 'postal.csv');

    const adminHash = fs.existsSync(adminPath)
      ? crypto.createHash('sha256').update(fs.readFileSync(adminPath)).digest('hex')
      : 'NOT_FOUND';
    const postalHash = fs.existsSync(postalPath)
      ? crypto.createHash('sha256').update(fs.readFileSync(postalPath)).digest('hex')
      : 'NOT_FOUND';

    const inputHashes = {
      admin: adminHash,
      postal: postalHash,
      csv: outputHash
    };

    // Step 1: Admin Boundary Match
    const adminResult = this.adminValidator.validate(records, adminPath);

    // Step 2: Postal Address Match
    const postalResult = this.postalValidator.validate(records, postalPath);

    // Step 3: Record Difference Analysis
    const diffResult = this.diffAnalyzer.analyze(records, expectedCount);

    // Step 4: Generate Evidence (AUDITED Status)
    const districtId = records[0]?.district_id || 'MIE-03';
    const evidence = this.reportGenerator.generate(
      districtId,
      inputHashes,
      outputHash,
      records.length,
      adminResult,
      postalResult,
      diffResult
    );

    // Save Evidence Artifact
    const branchDir = path.join(__dirname, '../../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区');
    const logsDir = path.join(branchDir, 'logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const evidencePath = path.join(logsDir, 'accuracy_evidence_package.json');
    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2), 'utf8');

    // Local platform sync copy
    const localEvidenceDir = path.join(__dirname, '../evidence');
    if (!fs.existsSync(localEvidenceDir)) fs.mkdirSync(localEvidenceDir, { recursive: true });
    fs.writeFileSync(path.join(localEvidenceDir, 'accuracy_evidence_package.json'), JSON.stringify(evidence, null, 2), 'utf8');

    return evidence;
  }
}

if (require.main === module) {
  console.log('🚀 Running AccuracyVerificationPipeline directly...');
  const csvPath = path.join(
    __dirname,
    '../../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/output/MIE-03_FINAL_VERIFIED_AREAS.csv'
  );
  const pipeline = new AccuracyVerificationPipeline();
  const result = pipeline.runVerification(csvPath, 651);
  console.log('✅ Accuracy Verification Complete!');
  console.log('Evidence:', JSON.stringify(result, null, 2));
}
