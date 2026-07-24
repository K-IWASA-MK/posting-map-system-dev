import * as fs from 'fs';
import * as path from 'path';
import { DataAcceptanceGate } from './DataAcceptanceGate';
import { AccuracyEvidence } from '../accuracy-verification/schema/AccuracySchema';

function main() {
  console.log('====================================================');
  console.log('🏛️  CEO DATA ACCEPTANCE GATE & RELEASE CONTROLLER');
  console.log('====================================================\n');

  const branchDir = path.join(__dirname, '../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区');
  const evidencePath = path.join(branchDir, 'logs/accuracy_evidence_package.json');
  const csvPath = path.join(branchDir, 'output/MIE-03_FINAL_VERIFIED_AREAS.csv');

  if (!fs.existsSync(evidencePath)) {
    throw new Error(`[DataAcceptanceGate] Accuracy Evidence Package not found at ${evidencePath}`);
  }

  const evidence: AccuracyEvidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

  console.log('📊 AUDIT SUMMARY CHECKLIST FOR CEO APPROVAL:');
  console.log(`  1. Target District          : ${evidence.district}`);
  console.log(`  2. Current Lifecycle Status : ${evidence.lifecycleStatus}`);
  console.log(`  3. Total Verified Records   : ${evidence.recordCount}`);
  console.log(`  4. Administrative Match     : ${evidence.administrativeMatchRate}%`);
  console.log(`  5. Postal Match             : ${evidence.postalMatchRate}%`);
  console.log(`  6. Missing Record Count     : ${evidence.missingCount}`);
  console.log(`  7. Extra Record Count       : ${evidence.extraCount}`);
  console.log(`  8. Postal Mismatch Count    : ${evidence.postalMismatchCount}`);
  console.log(`  9. Accuracy Status          : ${evidence.accuracyStatus}`);
  console.log(` 10. Output SHA-256 Hash      : ${evidence.outputHash}\n`);

  // Step 1: Request CEO Approval
  console.log('🔐 Requesting CEO Approval via Data Acceptance Gate...');
  const decision = DataAcceptanceGate.requestCEOApproval(evidence);

  console.log('====================================================');
  console.log(`✅ DECISION: ${decision.message}`);
  console.log(`   Approved By : ${decision.approvedBy}`);
  console.log(`   New Status  : ${decision.lifecycleStatus}`);
  console.log('====================================================\n');

  // Step 2: Execute Release Controller to Transition to FROZEN
  console.log('❄️  Executing Release Controller to FROZEN status...');
  const freezeResult = DataAcceptanceGate.approveAndFreeze(csvPath, decision);

  console.log('====================================================');
  console.log(`🎉 RELEASE COMPLETE!`);
  console.log(`   Final Status : ${freezeResult.finalStatus}`);
  console.log(`   Frozen CSV   : ${freezeResult.frozenCsvPath}`);
  console.log(`   Frozen Hash  : ${freezeResult.frozenHash}`);
  console.log('====================================================\n');
}

main();
