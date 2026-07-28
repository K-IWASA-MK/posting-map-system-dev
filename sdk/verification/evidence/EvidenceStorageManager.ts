/**
 * EvidenceStorageManager.ts
 * 
 * AIOS Evidence Storage Manager
 * 
 * 証跡データの標準ディレクトリ構造（screenshots/, console/, network/, runtime/, reports/）への永続化
 * および改ざん防止マニフェスト（integrity_manifest.json）の自動生成を実施する。
 */

import fs from 'fs';
import path from 'path';
import { VerificationEvidencePackage } from './VerificationEvidencePackage';
import { EvidenceIntegrityManager, EvidenceIntegrityManifest } from './EvidenceIntegrityManager';

export interface EvidenceSaveResult {
  readonly packageDir: string;
  readonly manifestPath: string;
  readonly screenshotPaths: readonly string[];
  readonly integrityManifest: EvidenceIntegrityManifest;
}

export class EvidenceStorageManager {
  /**
   * VerificationEvidencePackage を標準フォルダ構造に永続化し、SHA-256 改ざん防止マニフェストを生成する
   */
  static async saveEvidencePackage(
    pkg: VerificationEvidencePackage,
    outputBaseDir?: string
  ): Promise<EvidenceSaveResult> {
    const base = outputBaseDir || path.join(process.cwd(), 'evidence');
    const packageDir = path.join(base, 'packages', pkg.verificationId);

    const screenshotsDir = path.join(packageDir, 'screenshots');
    const consoleDir = path.join(packageDir, 'console');
    const networkDir = path.join(packageDir, 'network');
    const runtimeDir = path.join(packageDir, 'runtime');
    const reportsDir = path.join(packageDir, 'reports');

    fs.mkdirSync(screenshotsDir, { recursive: true });
    fs.mkdirSync(consoleDir, { recursive: true });
    fs.mkdirSync(networkDir, { recursive: true });
    fs.mkdirSync(runtimeDir, { recursive: true });
    fs.mkdirSync(reportsDir, { recursive: true });

    // 1. Save Screenshots
    const screenshotPaths: string[] = [];
    pkg.screenshots.forEach((sc, idx) => {
      const filename = `screenshot_${idx + 1}.png`;
      const scPath = path.join(screenshotsDir, filename);
      // Strip base64 prefix if present
      const base64Data = sc.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(scPath, buffer);
      screenshotPaths.push(scPath);
    });

    // 2. Save Console Logs
    const consolePath = path.join(consoleDir, 'console_logs.json');
    fs.writeFileSync(consolePath, JSON.stringify(pkg.consoleLogs, null, 2), 'utf-8');

    // 3. Save Network Logs
    const networkPath = path.join(networkDir, 'network_logs.json');
    fs.writeFileSync(networkPath, JSON.stringify(pkg.networkLogs, null, 2), 'utf-8');

    // 4. Save Runtime & Snapshot
    const runtimePath = path.join(runtimeDir, 'capability_snapshot.json');
    fs.writeFileSync(runtimePath, JSON.stringify(pkg.capabilitySnapshot, null, 2), 'utf-8');

    if (pkg.domSnapshot) {
      const domPath = path.join(runtimeDir, 'dom_snapshot.html');
      fs.writeFileSync(domPath, pkg.domSnapshot, 'utf-8');
    }

    // 5. Save Summary & Detailed Reports
    const reportJsonPath = path.join(reportsDir, 'verification_report.json');
    fs.writeFileSync(reportJsonPath, JSON.stringify({
      verificationId: pkg.verificationId,
      taskId: pkg.taskId,
      timestamp: pkg.timestamp,
      gitCommit: pkg.gitCommit,
      finalStatus: pkg.finalStatus,
      completionGatePassed: pkg.completionGatePassed,
      deploymentResult: pkg.deploymentResult,
      browserResult: pkg.browserResult
    }, null, 2), 'utf-8');

    // 6. Generate Cryptographic Integrity Manifest
    const integrityManifest = EvidenceIntegrityManager.generateManifest(pkg.verificationId, packageDir);
    const manifestPath = path.join(packageDir, 'integrity_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(integrityManifest, null, 2), 'utf-8');

    return Object.freeze({
      packageDir,
      manifestPath,
      screenshotPaths: Object.freeze(screenshotPaths),
      integrityManifest
    });
  }
}
