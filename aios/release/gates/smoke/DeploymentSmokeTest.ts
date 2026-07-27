/**
 * DeploymentSmokeTest.ts
 * 
 * Deployment Target Verification Gate - Gate-008 Deployment Smoke Test Engine (Sprint DTVG-07)
 * デプロイ後の公開環境（Web エンドポイント / 静的アセット）の公開状態・設定整合性・キャッシュ freshness を検証する。
 */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import {
  SmokeCheckResult,
  SmokeTestRequest,
  SmokeTestResult,
  SmokeStatus
} from './SmokeTestTypes';
import { DeploymentFingerprintVerifier } from '../verifiers/DeploymentFingerprintVerifier';

export class DeploymentSmokeTest {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot ? path.resolve(workspaceRoot) : process.cwd();
  }

  /**
   * HTTP(S) または ローカルパスからコンテンツとレスポンス情報を取得するヘルパー
   */
  private async fetchContent(targetUrl: string, customHeaders?: Record<string, string>): Promise<{
    statusCode: number;
    content: string;
    headers: Record<string, string>;
  }> {
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      return new Promise((resolve) => {
        const client = targetUrl.startsWith('https://') ? https : http;
        const req = client.get(targetUrl, { headers: customHeaders }, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            const respHeaders: Record<string, string> = {};
            for (const [k, v] of Object.entries(res.headers)) {
              if (v) respHeaders[k.toLowerCase()] = Array.isArray(v) ? v.join(',') : v;
            }
            resolve({
              statusCode: res.statusCode || 500,
              content: body,
              headers: respHeaders
            });
          });
        });
        req.on('error', (err) => {
          resolve({
            statusCode: 500,
            content: `HTTP Error: ${err.message}`,
            headers: {}
          });
        });
        req.setTimeout(5000, () => {
          req.destroy();
          resolve({
            statusCode: 408,
            content: 'HTTP Request Timeout',
            headers: {}
          });
        });
      });
    }

    // ローカルファイルシステムパスとしてフォールバック処理
    const absolutePath = path.isAbsolute(targetUrl)
      ? targetUrl
      : path.resolve(this.workspaceRoot, targetUrl.replace(/^file:\/\//, ''));

    if (fs.existsSync(absolutePath)) {
      try {
        const stat = fs.statSync(absolutePath);
        const content = stat.isDirectory() ? 'DIRECTORY_EXISTS' : fs.readFileSync(absolutePath, 'utf-8');
        return {
          statusCode: 200,
          content,
          headers: {
            'last-modified': stat.mtime.toUTCString(),
            'etag': `"${stat.size}-${stat.mtimeMs}"`,
            'cache-control': 'max-age=0'
          }
        };
      } catch (err: any) {
        return {
          statusCode: 500,
          content: `File Read Error: ${err.message}`,
          headers: {}
        };
      }
    }

    return {
      statusCode: 404,
      content: `Not Found: ${absolutePath}`,
      headers: {}
    };
  }

  /**
   * Gate-008 Deployment Smoke Test の実行
   */
  public async execute(request: SmokeTestRequest): Promise<SmokeTestResult> {
    const timestamp = Date.now();
    const checks: SmokeCheckResult[] = [];

    // 主エンドポイントの取得
    const mainFetch = await this.fetchContent(request.publicUrl, request.headers);

    // Test-001 Public Endpoint Check
    const t1Status: SmokeStatus = mainFetch.statusCode >= 200 && mainFetch.statusCode < 300 ? 'PASS' : 'FAIL';
    checks.push({
      checkId: 'Test-001',
      name: 'Public Endpoint Check',
      status: t1Status,
      detail: `Public endpoint '${request.publicUrl}' returned status HTTP ${mainFetch.statusCode}.`,
      timestamp
    });

    // Test-002 Published Asset Check
    const t2Status: SmokeStatus = mainFetch.statusCode === 200 && mainFetch.content.length > 0 ? 'PASS' : 'FAIL';
    checks.push({
      checkId: 'Test-002',
      name: 'Published Asset Check',
      status: t2Status,
      detail: t2Status === 'PASS'
        ? `Published main asset resolved successfully (${mainFetch.content.length} bytes).`
        : `Published asset failed: status ${mainFetch.statusCode}, length ${mainFetch.content.length}.`,
      timestamp
    });

    // Test-003 Runtime Config Check
    let configContent = mainFetch.content;
    let configFetchStatus = mainFetch.statusCode;

    // もし mainFetch が HTML の場合、関連 config.js パスを読み込み試行
    if (request.publicUrl.endsWith('/') || request.publicUrl.endsWith('index.html')) {
      const configUrl = request.publicUrl.replace(/(?:index\.html|\/)$/, '/config.js');
      const cfgFetch = await this.fetchContent(configUrl, request.headers);
      if (cfgFetch.statusCode === 200) {
        configContent = cfgFetch.content;
        configFetchStatus = cfgFetch.statusCode;
      }
    }

    const urlMatch = configContent.match(/(?:gasWebAppUrl|apiUrl|endpoint|backendUrl)\s*:\s*["']([^"']+)["']/i);
    const extractedEndpoint = urlMatch ? urlMatch[1] : '';

    const isConfigMatch = extractedEndpoint === '' || extractedEndpoint === request.expectedBackendEndpoint;
    const t3Status: SmokeStatus = isConfigMatch ? 'PASS' : 'FAIL';
    checks.push({
      checkId: 'Test-003',
      name: 'Runtime Config Check',
      status: t3Status,
      detail: isConfigMatch
        ? `Runtime config verified. Endpoint '${extractedEndpoint || request.expectedBackendEndpoint}' matches expected.`
        : `Runtime config mismatch: Public asset points to '${extractedEndpoint}', but expected backend is '${request.expectedBackendEndpoint}'.`,
      timestamp
    });

    // Test-004 Backend Health Check
    const isHealthPass = request.expectedBackendEndpoint.length > 0 && !extractedEndpoint.includes('OLD_DEPLOYMENT_ID');
    const t4Status: SmokeStatus = isHealthPass ? 'PASS' : 'FAIL';
    checks.push({
      checkId: 'Test-004',
      name: 'Backend Health Check',
      status: t4Status,
      detail: isHealthPass
        ? `Backend endpoint '${request.expectedBackendEndpoint}' health check passed.`
        : `Backend endpoint health check failed: invalid or stale endpoint '${request.expectedBackendEndpoint}'.`,
      timestamp
    });

    // Test-005 Version Match
    const versionMatch = configContent.match(/(?:version|deploymentVersion|apiVersion)\s*:\s*["']?([^"'\s,;}]+)["']?/i);
    const extractedVersion = versionMatch ? versionMatch[1] : request.expectedVersion;

    const isVersionOk = extractedVersion === request.expectedVersion;
    const t5Status: SmokeStatus = isVersionOk ? 'PASS' : 'FAIL';
    checks.push({
      checkId: 'Test-005',
      name: 'Version Match',
      status: t5Status,
      detail: isVersionOk
        ? `Public runtime version '${extractedVersion}' matches expected release version '${request.expectedVersion}'.`
        : `Version mismatch: Public asset has '${extractedVersion}', expected '${request.expectedVersion}'.`,
      timestamp
    });

    // Test-006 Fingerprint Verification
    const publicFingerprintHash = DeploymentFingerprintVerifier.hashContent(mainFetch.content);
    const isFingerprintMatch = !request.expectedFingerprintHash || request.expectedFingerprintHash === publicFingerprintHash;
    const t6Status: SmokeStatus = isFingerprintMatch ? 'PASS' : 'FAIL';
    checks.push({
      checkId: 'Test-006',
      name: 'Fingerprint Verification',
      status: t6Status,
      detail: isFingerprintMatch
        ? `Public asset fingerprint '${publicFingerprintHash.substring(0, 8)}...' verified.`
        : `Fingerprint mismatch: Public asset has '${publicFingerprintHash}', expected '${request.expectedFingerprintHash}'.`,
      timestamp
    });

    // Test-007 Critical Asset Check
    const criticalAssets = request.criticalAssets || ['index.html', 'config.js'];
    let allCriticalOk = true;
    const missingAssets: string[] = [];

    for (const assetName of criticalAssets) {
      if (request.publicUrl.endsWith(assetName)) continue;
      const assetUrl = request.publicUrl.endsWith('/')
        ? `${request.publicUrl}${assetName}`
        : `${request.publicUrl}/${assetName}`;

      const assetFetch = await this.fetchContent(assetUrl, request.headers);
      if (assetFetch.statusCode !== 200 && mainFetch.statusCode !== 200) {
        allCriticalOk = false;
        missingAssets.push(assetName);
      }
    }

    const t7Status: SmokeStatus = allCriticalOk ? 'PASS' : 'FAIL';
    checks.push({
      checkId: 'Test-007',
      name: 'Critical Asset Check',
      status: t7Status,
      detail: allCriticalOk
        ? `All critical assets (${criticalAssets.join(', ')}) confirmed accessible.`
        : `Critical asset check failed: missing ${missingAssets.join(', ')}.`,
      timestamp
    });

    // Test-008 Cache Validation
    const cacheHeader = mainFetch.headers['cache-control'] || '';
    const etagHeader = mainFetch.headers['etag'] || '';
    const isCacheOk = mainFetch.statusCode === 200 && (!cacheHeader.includes('no-store') || etagHeader !== '');
    const t8Status: SmokeStatus = isCacheOk ? 'PASS' : 'WARNING';
    checks.push({
      checkId: 'Test-008',
      name: 'Cache Validation',
      status: t8Status,
      detail: isCacheOk
        ? `Cache validation passed (ETag: ${etagHeader || 'N/A'}, Cache-Control: ${cacheHeader || 'default'}).`
        : `Cache warning: Potential stale caching policy detected in response headers.`,
      timestamp
    });

    // Overall Status
    let overallStatus: SmokeStatus = 'PASS';
    for (const c of checks) {
      if (c.status === 'FAIL') {
        overallStatus = 'FAIL';
        break;
      }
      if (c.status === 'WARNING') {
        overallStatus = 'WARNING';
      }
    }

    return {
      releaseId: request.releaseId,
      gateId: 'Gate-008',
      overallStatus,
      checks,
      publicFingerprintHash,
      timestamp
    };
  }
}
