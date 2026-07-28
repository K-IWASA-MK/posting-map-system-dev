/**
 * BrowserVerificationRuntime.ts
 * 
 * Browser Verification Runtime
 * 
 * Capability Execution Gate チェック、ドライバ制御、証跡自動収集、結果生成を実施する。
 */

import { VerificationCapabilityRegistry } from '../VerificationCapabilityRegistry';
import { VerificationCapabilityStatus, VerificationCapabilityType } from '../VerificationCapabilityModel';
import {
  BrowserVerificationActionType,
  BrowserVerificationRequest,
  BrowserVerificationResult
} from './BrowserVerificationModels';
import { IBrowserDriverAdapter } from './IBrowserDriverAdapter';
import { CDPBrowserDriverAdapter } from './CDPBrowserDriverAdapter';

export interface BrowserVerificationRuntimeOptions {
  readonly driver?: IBrowserDriverAdapter;
  readonly bypassCapabilityCheck?: boolean;
}

export class BrowserVerificationRuntime {
  private readonly driver: IBrowserDriverAdapter;
  private readonly bypassCapabilityCheck: boolean;

  constructor(options: BrowserVerificationRuntimeOptions = {}) {
    this.driver = options.driver || new CDPBrowserDriverAdapter();
    this.bypassCapabilityCheck = options.bypassCapabilityCheck || false;
  }

  /**
   * ブラウザ検証リクエストを実行し、詳細結果および証跡データを集約する
   */
  async executeVerification(request: BrowserVerificationRequest): Promise<BrowserVerificationResult> {
    const startTime = Date.now();

    // 1. Capability Execution Gate
    if (!this.bypassCapabilityCheck) {
      const hasBrowserAutomation = VerificationCapabilityRegistry.hasCapability(
        VerificationCapabilityType.BROWSER_AUTOMATION,
        VerificationCapabilityStatus.AVAILABLE
      );
      const hasCdpEndpoint = VerificationCapabilityRegistry.hasCapability(
        VerificationCapabilityType.CDP_ENDPOINT,
        VerificationCapabilityStatus.AVAILABLE
      );

      if (!hasBrowserAutomation && !hasCdpEndpoint) {
        return Object.freeze({
          verificationId: request.verificationId,
          status: 'BLOCKED',
          targetUrl: request.targetUrl,
          durationMs: Date.now() - startTime,
          screenshotCount: 0,
          domSnapshotLength: 0,
          consoleLogCount: 0,
          networkLogCount: 0,
          evidence: Object.freeze({
            screenshots: Object.freeze([]),
            consoleLogs: Object.freeze([]),
            networkLogs: Object.freeze([])
          }),
          error: 'Capability Execution Gate Blocked: BROWSER_AUTOMATION and CDP_ENDPOINT are UNAVAILABLE in Capability Registry'
        });
      }
    }

    // 2. ブラウザドライバ接続
    try {
      await this.driver.connect(request.cdpEndpoint);
      await this.driver.navigate(request.targetUrl);

      const screenshots: string[] = [];
      let domSnapshot = '';

      // 3. アクション順次実行
      for (const action of request.actions) {
        switch (action.type) {
          case BrowserVerificationActionType.NAVIGATE:
            if (action.target) {
              await this.driver.navigate(action.target);
            }
            break;
          case BrowserVerificationActionType.SCREENSHOT:
            screenshots.push(await this.driver.takeScreenshot());
            break;
          case BrowserVerificationActionType.DOM_SNAPSHOT:
            domSnapshot = await this.driver.getDOMSnapshot();
            break;
          case BrowserVerificationActionType.CLICK:
            if (action.target) {
              await this.driver.click(action.target);
            }
            break;
          case BrowserVerificationActionType.INPUT:
            if (action.target && action.value) {
              await this.driver.input(action.target, action.value);
            }
            break;
          default:
            break;
        }
      }

      // デフォルトでスクリーンショットと DOM Snapshot が無い場合は自動キャプチャ
      if (screenshots.length === 0) {
        screenshots.push(await this.driver.takeScreenshot());
      }
      if (!domSnapshot) {
        domSnapshot = await this.driver.getDOMSnapshot();
      }

      const consoleLogs = await this.driver.getConsoleLogs();
      const networkLogs = await this.driver.getNetworkLogs();

      await this.driver.disconnect();

      return Object.freeze({
        verificationId: request.verificationId,
        status: 'PASS',
        targetUrl: request.targetUrl,
        durationMs: Date.now() - startTime,
        screenshotCount: screenshots.length,
        domSnapshotLength: domSnapshot.length,
        consoleLogCount: consoleLogs.length,
        networkLogCount: networkLogs.length,
        evidence: Object.freeze({
          screenshots: Object.freeze(screenshots),
          domSnapshot,
          consoleLogs,
          networkLogs
        })
      });
    } catch (err: any) {
      try {
        await this.driver.disconnect();
      } catch {}

      return Object.freeze({
        verificationId: request.verificationId,
        status: 'FAIL',
        targetUrl: request.targetUrl,
        durationMs: Date.now() - startTime,
        screenshotCount: 0,
        domSnapshotLength: 0,
        consoleLogCount: 0,
        networkLogCount: 0,
        evidence: Object.freeze({
          screenshots: Object.freeze([]),
          consoleLogs: Object.freeze([]),
          networkLogs: Object.freeze([])
        }),
        error: err.message || 'Browser verification execution error'
      });
    }
  }
}
