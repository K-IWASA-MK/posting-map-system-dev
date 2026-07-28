/**
 * CDPDetector.ts
 * 
 * Chrome / Chromium Chrome DevTools Protocol (CDP) エンドポイント検出器
 * 
 * セキュリティ境界:
 * GET http://localhost:9222/json/version に対する読み取り専用メタデータ取得のみを行う。
 * ページのスクリプト実行、DOM操作、クッキー取得等は一切行わない。
 */

import http from 'http';
import {
  ICapabilityDetector,
  VerificationCapabilityDetectionResult
} from '../VerificationCapabilityDetector';
import {
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../VerificationCapabilityModel';

export interface CDPDetectorOptions {
  readonly host?: string;
  readonly port?: number;
  readonly timeoutMs?: number;
}

export class CDPDetector implements ICapabilityDetector {
  readonly detectorName = 'CDPDetector';
  private readonly host: string;
  private readonly port: number;
  private readonly timeoutMs: number;

  constructor(options: CDPDetectorOptions = {}) {
    this.host = options.host || 'localhost';
    this.port = options.port || 9222;
    this.timeoutMs = options.timeoutMs || 2000;
  }

  async detect(): Promise<readonly VerificationCapabilityDetectionResult[]> {
    const targetUrl = `http://${this.host}:${this.port}/json/version`;

    try {
      const data = await this.fetchVersionMetadata(targetUrl);
      const webSocketUrl = data['webSocketDebuggerUrl'] || data['WebSocketDebuggerUrl'];
      const browser = data['Browser'] || data['browser'] || 'Chrome';
      const protocolVersion = data['Protocol-Version'] || data['protocol-version'];

      return Object.freeze([
        {
          type: VerificationCapabilityType.CDP_ENDPOINT,
          status: VerificationCapabilityStatus.AVAILABLE,
          endpoint: targetUrl,
          permission: 'READ_ONLY_PROBE',
          metadata: {
            host: this.host,
            port: this.port,
            webSocketDebuggerUrl: webSocketUrl,
            browser,
            protocolVersion
          }
        },
        {
          type: VerificationCapabilityType.BROWSER_AUTOMATION,
          status: VerificationCapabilityStatus.AVAILABLE,
          endpoint: targetUrl,
          permission: 'AUTOMATION_READINESS',
          metadata: {
            browser,
            cdpAvailable: true
          }
        }
      ]);
    } catch (err: any) {
      return Object.freeze([
        {
          type: VerificationCapabilityType.CDP_ENDPOINT,
          status: VerificationCapabilityStatus.UNAVAILABLE,
          endpoint: targetUrl,
          error: err.message || 'CDP endpoint unreachable',
          metadata: {
            host: this.host,
            port: this.port,
            reason: err.message || 'Connection refused or timeout'
          }
        },
        {
          type: VerificationCapabilityType.BROWSER_AUTOMATION,
          status: VerificationCapabilityStatus.UNAVAILABLE,
          endpoint: targetUrl,
          error: err.message || 'Browser automation unavailable without CDP endpoint',
          metadata: {
            cdpAvailable: false,
            reason: err.message || 'CDP endpoint unreachable'
          }
        }
      ]);
    }
  }

  private fetchVersionMetadata(url: string): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      const req = http.get(url, { timeout: this.timeoutMs }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`CDP HTTP status code ${res.statusCode}`));
        }

        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve(parsed);
          } catch (e: any) {
            reject(new Error(`Invalid JSON response from CDP: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`CDP Probe request timed out after ${this.timeoutMs}ms`));
      });
    });
  }
}
