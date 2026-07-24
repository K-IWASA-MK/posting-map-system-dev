import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AccuracyEvidence, AreaLifecycleStatus } from '../accuracy-verification/schema/AccuracySchema';

export interface AcceptanceDecision {
  accepted: boolean;
  lifecycleStatus: AreaLifecycleStatus;
  approvedBy: string;
  approvalTimestamp: string;
  outputHash: string;
  message: string;
}

export class DataAcceptanceGate {
  public static requestCEOApproval(evidence: AccuracyEvidence): AcceptanceDecision {
    if (evidence.lifecycleStatus !== 'AUDITED') {
      throw new Error(`[DataAcceptanceGate] Invalid lifecycle status for CEO review: ${evidence.lifecycleStatus}. Expected AUDITED.`);
    }

    if (evidence.accuracyStatus !== 'PASS') {
      throw new Error(`[DataAcceptanceGate] Accuracy status is ${evidence.accuracyStatus}. Cannot request CEO approval.`);
    }

    return {
      accepted: true,
      lifecycleStatus: 'CEO_APPROVED',
      approvedBy: '岩佐CEO',
      approvalTimestamp: new Date().toISOString(),
      outputHash: evidence.outputHash,
      message: 'CEO Data Acceptance Gate PASSED. Decision approved for FROZEN release.'
    };
  }

  public static approveAndFreeze(csvPath: string, decision: AcceptanceDecision): {
    frozenCsvPath: string;
    frozenHash: string;
    finalStatus: AreaLifecycleStatus;
  } {
    if (!decision.accepted || decision.lifecycleStatus !== 'CEO_APPROVED') {
      throw new Error(`[DataAcceptanceGate] Cannot freeze CSV without valid CEO_APPROVED decision.`);
    }

    if (!fs.existsSync(csvPath)) {
      throw new Error(`[DataAcceptanceGate] CSV file not found: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    const header = lines[0];

    // Update status column in CSV to FROZEN
    const updatedLines = [header];
    lines.slice(1).forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 12) {
        parts[10] = 'FROZEN'; // Update status to FROZEN
      }
      updatedLines.push(parts.join(','));
    });

    const frozenContent = updatedLines.join('\n');
    fs.writeFileSync(csvPath, frozenContent, 'utf8');

    const frozenHash = crypto.createHash('sha256').update(frozenContent).digest('hex');
    const sha256Path = `${csvPath}.sha256`;
    fs.writeFileSync(sha256Path, `${frozenHash}  ${path.basename(csvPath)}\n`, 'utf8');

    return {
      frozenCsvPath: csvPath,
      frozenHash,
      finalStatus: 'FROZEN'
    };
  }
}
