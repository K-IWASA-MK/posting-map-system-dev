/**
 * RuntimeEndpointVerifier.ts
 * 
 * Deployment Target Verification Gate - Runtime Verification Layer (Sprint DTVG-03)
 * Frontend 設定 (例: config.js) の API エンドポイント / GAS WebApp URL と
 * 登録済み Backend Deployment の整合性を検証し、Gate-004 の判定結果を生成する。
 */

import * as fs from 'fs';
import * as path from 'path';
import { GateResult, VerificationStatus } from '../types/DeploymentTargetGateTypes';

export interface RuntimeEndpointConfig {
  configPath: string;
  extractedEndpoint: string;
  extractedVersion?: string;
}

export class RuntimeEndpointVerifier {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot ? path.resolve(workspaceRoot) : process.cwd();
  }

  /**
   * Frontend 設定ファイルからエンドポイント情報を抽出・確認する
   */
  public extractConfigInfo(configPath: string): RuntimeEndpointConfig {
    const absolutePath = path.isAbsolute(configPath)
      ? path.resolve(configPath)
      : path.resolve(this.workspaceRoot, configPath);

    if (!fs.existsSync(absolutePath)) {
      return {
        configPath,
        extractedEndpoint: '',
        extractedVersion: undefined
      };
    }

    try {
      const content = fs.readFileSync(absolutePath, 'utf-8');

      // gasWebAppUrl や apiUrl などの設定パターンを正規表現で検出
      const urlMatch = content.match(/(?:gasWebAppUrl|apiUrl|endpoint|backendUrl)\s*:\s*["']([^"']+)["']/i);
      const extractedEndpoint = urlMatch ? urlMatch[1] : '';

      const versionMatch = content.match(/(?:version|deploymentVersion|apiVersion)\s*:\s*["']?([^"'\s,;}]+)["']?/i);
      const extractedVersion = versionMatch ? versionMatch[1] : undefined;

      return {
        configPath,
        extractedEndpoint,
        extractedVersion
      };
    } catch (err) {
      return {
        configPath,
        extractedEndpoint: '',
        extractedVersion: undefined
      };
    }
  }

  /**
   * Gate-004: Runtime Config Match 検証
   * frontend endpoint == registered backend deployment
   */
  public verifyRuntimeEndpoint(
    frontendConfigPath: string,
    expectedBackendEndpoint: string,
    expectedBackendVersion?: string
  ): GateResult {
    const configInfo = this.extractConfigInfo(frontendConfigPath);

    if (!configInfo.extractedEndpoint) {
      // 設定ファイルが存在しないか、エンドポイントが抽出できない場合
      const status: VerificationStatus = 'FAIL';
      const detail = `Runtime Config mismatch: Could not extract backend endpoint from '${frontendConfigPath}'`;

      return {
        gateId: 'Gate-004',
        name: 'Runtime Config Match',
        status,
        detail,
        timestamp: Date.now()
      };
    }

    const normalizedExtracted = configInfo.extractedEndpoint.trim();
    const normalizedExpected = expectedBackendEndpoint.trim();

    const isEndpointMatch = normalizedExtracted === normalizedExpected;
    const isVersionMatch = !expectedBackendVersion || configInfo.extractedVersion === expectedBackendVersion.trim();

    const isMatch = isEndpointMatch && isVersionMatch;

    const status: VerificationStatus = isMatch ? 'PASS' : 'FAIL';
    const detail = isMatch
      ? `Runtime Config matched: Endpoint '${normalizedExtracted}' matches expected backend endpoint.`
      : `Runtime Config mismatch: Frontend config has '${normalizedExtracted}', but expected backend is '${normalizedExpected}'${
          expectedBackendVersion ? ` (expected version: ${expectedBackendVersion})` : ''
        }`;

    return {
      gateId: 'Gate-004',
      name: 'Runtime Config Match',
      status,
      detail,
      timestamp: Date.now()
    };
  }
}
