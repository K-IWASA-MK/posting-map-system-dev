/**
 * BrowserVerificationModels.ts
 * 
 * Browser Verification Runtime Models
 */

export enum BrowserVerificationActionType {
  NAVIGATE = 'NAVIGATE',
  SCREENSHOT = 'SCREENSHOT',
  DOM_SNAPSHOT = 'DOM_SNAPSHOT',
  CONSOLE_CAPTURE = 'CONSOLE_CAPTURE',
  NETWORK_CAPTURE = 'NETWORK_CAPTURE',
  CLICK = 'CLICK',
  INPUT = 'INPUT'
}

export interface BrowserVerificationAction {
  readonly type: BrowserVerificationActionType;
  readonly target?: string;
  readonly value?: string;
  readonly options?: Record<string, any>;
}

export interface BrowserVerificationRequest {
  readonly verificationId: string;
  readonly targetUrl: string;
  readonly actions: readonly BrowserVerificationAction[];
  readonly cdpEndpoint?: string;
  readonly timeoutMs?: number;
}

export interface BrowserVerificationResult {
  readonly verificationId: string;
  readonly status: 'PASS' | 'FAIL' | 'BLOCKED';
  readonly targetUrl: string;
  readonly durationMs: number;
  readonly screenshotCount: number;
  readonly domSnapshotLength: number;
  readonly consoleLogCount: number;
  readonly networkLogCount: number;
  readonly evidence: {
    readonly screenshots: readonly string[];
    readonly domSnapshot?: string;
    readonly consoleLogs: readonly any[];
    readonly networkLogs: readonly any[];
  };
  readonly error?: string;
}
