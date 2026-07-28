/**
 * IBrowserDriverAdapter.ts
 * 
 * ブラウザ制御抽象化アダプタインターフェース
 */

export interface IBrowserDriverAdapter {
  connect(endpoint?: string): Promise<boolean>;
  navigate(url: string): Promise<{ statusCode: number; finalUrl: string }>;
  takeScreenshot(): Promise<string>;
  getDOMSnapshot(): Promise<string>;
  getConsoleLogs(): Promise<readonly any[]>;
  getNetworkLogs(): Promise<readonly any[]>;
  click(selector: string): Promise<boolean>;
  input(selector: string, text: string): Promise<boolean>;
  disconnect(): Promise<void>;
}
