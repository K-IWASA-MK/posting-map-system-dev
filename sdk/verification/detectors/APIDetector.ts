/**
 * APIDetector.ts
 * 
 * 汎用 API エンドポイント導通・アクセス可否診断器
 * 
 * 設定可能な endpoints 入力に対応し、特定アプリに依存しない汎用的な診断を実施する。
 */

import http from 'http';
import https from 'https';
import {
  ICapabilityDetector,
  VerificationCapabilityDetectionResult
} from '../VerificationCapabilityDetector';
import {
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../VerificationCapabilityModel';

export interface TargetApiEndpoint {
  readonly name: string;
  readonly url: string;
  readonly timeoutMs?: number;
}

export interface APIDetectorOptions {
  readonly endpoints?: readonly TargetApiEndpoint[];
}

export class APIDetector implements ICapabilityDetector {
  readonly detectorName = 'APIDetector';
  private readonly endpoints: readonly TargetApiEndpoint[];

  constructor(options: APIDetectorOptions = {}) {
    this.endpoints = options.endpoints || [];
  }

  async detect(): Promise<readonly VerificationCapabilityDetectionResult[]> {
    if (this.endpoints.length === 0) {
      return Object.freeze([
        {
          type: VerificationCapabilityType.API_ACCESS,
          status: VerificationCapabilityStatus.UNTESTED,
          permission: 'HTTP_ACCESS',
          metadata: {
            configuredEndpoints: 0,
            note: 'No specific API endpoints provided for active probing'
          }
        }
      ]);
    }

    const probeResults = await Promise.all(
      this.endpoints.map((ep) => this.probeEndpoint(ep))
    );

    const availableCount = probeResults.filter((r) => r.available).length;
    let overallStatus = VerificationCapabilityStatus.UNAVAILABLE;

    if (availableCount === probeResults.length) {
      overallStatus = VerificationCapabilityStatus.AVAILABLE;
    } else if (availableCount > 0) {
      overallStatus = VerificationCapabilityStatus.DEGRADED;
    }

    return Object.freeze([
      {
        type: VerificationCapabilityType.API_ACCESS,
        status: overallStatus,
        permission: 'HTTP_ACCESS',
        metadata: {
          configuredEndpoints: this.endpoints.length,
          availableCount,
          probeResults
        }
      }
    ]);
  }

  private probeEndpoint(endpoint: TargetApiEndpoint): Promise<{ name: string; url: string; available: boolean; statusCode?: number; error?: string }> {
    return new Promise((resolve) => {
      const timeoutMs = endpoint.timeoutMs || 2000;
      const client = endpoint.url.startsWith('https') ? https : http;

      try {
        const req = client.get(endpoint.url, { timeout: timeoutMs }, (res) => {
          const available = res.statusCode !== undefined && res.statusCode < 500;
          resolve({
            name: endpoint.name,
            url: endpoint.url,
            available,
            statusCode: res.statusCode
          });
        });

        req.on('error', (err) => {
          resolve({
            name: endpoint.name,
            url: endpoint.url,
            available: false,
            error: err.message
          });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({
            name: endpoint.name,
            url: endpoint.url,
            available: false,
            error: `Request timed out after ${timeoutMs}ms`
          });
        });
      } catch (err: any) {
        resolve({
          name: endpoint.name,
          url: endpoint.url,
          available: false,
          error: err.message
        });
      }
    });
  }
}
