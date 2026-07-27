/**
 * DeploymentFingerprintVerifier.ts
 * 
 * Deployment Target Verification Gate - Fingerprint Verification Layer (Sprint DTVG-03)
 * Repository SHA, Build Hash, Deployment ID, Runtime Config Hash から構成される
 * デプロイ成果物の一意性 Fingerprint を計算・照合し、Gate-007 の判定結果を生成する。
 */

import * as crypto from 'crypto';
import { DeploymentFingerprint, GateResult, VerificationStatus } from '../types/DeploymentTargetGateTypes';

export class DeploymentFingerprintVerifier {
  /**
   * 個別要素から DeploymentFingerprint 構造体および合成ハッシュを生成する
   */
  public static calculateFingerprint(
    repositorySha: string,
    buildHash: string,
    deploymentId: string,
    runtimeConfigHash: string
  ): DeploymentFingerprint {
    const rawString = `${repositorySha}:${buildHash}:${deploymentId}:${runtimeConfigHash}`;
    const fingerprintHash = crypto.createHash('sha256').update(rawString).digest('hex');

    return {
      repositorySha,
      buildHash,
      deploymentId,
      runtimeConfigHash,
      fingerprintHash
    };
  }

  /**
   * 任意の文字列コンテンツから SHA256 ハッシュを計算するヘルパー
   */
  public static hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Gate-007: Deployment Fingerprint Match 検証
   * requested fingerprint == verified fingerprint
   */
  public static verifyFingerprint(
    requestedFingerprint: Partial<DeploymentFingerprint> | undefined,
    actualFingerprint: DeploymentFingerprint
  ): GateResult {
    if (!requestedFingerprint) {
      return {
        gateId: 'Gate-007',
        name: 'Deployment Fingerprint Match',
        status: 'FAIL',
        detail: 'Fingerprint mismatch: Requested fingerprint is missing or undefined.',
        timestamp: Date.now()
      };
    }

    // fingerprintHash が直接与えられている場合はハッシュ文字列を照合
    if (requestedFingerprint.fingerprintHash) {
      const isHashMatch = requestedFingerprint.fingerprintHash === actualFingerprint.fingerprintHash;
      const status: VerificationStatus = isHashMatch ? 'PASS' : 'FAIL';
      const detail = isHashMatch
        ? `Deployment Fingerprint matched: hash '${actualFingerprint.fingerprintHash.substring(0, 8)}...'`
        : `Deployment Fingerprint mismatch: requested '${requestedFingerprint.fingerprintHash}', actual '${actualFingerprint.fingerprintHash}'`;

      return {
        gateId: 'Gate-007',
        name: 'Deployment Fingerprint Match',
        status,
        detail,
        timestamp: Date.now()
      };
    }

    // 個別コンポーネントが指定されている場合は各項目を比較
    const isRepoMatch = !requestedFingerprint.repositorySha || requestedFingerprint.repositorySha === actualFingerprint.repositorySha;
    const isBuildMatch = !requestedFingerprint.buildHash || requestedFingerprint.buildHash === actualFingerprint.buildHash;
    const isDeployMatch = !requestedFingerprint.deploymentId || requestedFingerprint.deploymentId === actualFingerprint.deploymentId;
    const isConfigMatch = !requestedFingerprint.runtimeConfigHash || requestedFingerprint.runtimeConfigHash === actualFingerprint.runtimeConfigHash;

    const isMatch = isRepoMatch && isBuildMatch && isDeployMatch && isConfigMatch;
    const status: VerificationStatus = isMatch ? 'PASS' : 'FAIL';
    const detail = isMatch
      ? `Deployment Fingerprint matched across all components.`
      : `Deployment Fingerprint mismatch in components: repoMatch=${isRepoMatch}, buildMatch=${isBuildMatch}, deployMatch=${isDeployMatch}, configMatch=${isConfigMatch}`;

    return {
      gateId: 'Gate-007',
      name: 'Deployment Fingerprint Match',
      status,
      detail,
      timestamp: Date.now()
    };
  }
}
