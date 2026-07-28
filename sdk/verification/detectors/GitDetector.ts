/**
 * GitDetector.ts
 * 
 * Git 実行環境およびリポジトリ診断器
 */

import { execSync } from 'child_process';
import {
  ICapabilityDetector,
  VerificationCapabilityDetectionResult
} from '../VerificationCapabilityDetector';
import {
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../VerificationCapabilityModel';

export interface GitDetectorOptions {
  readonly cwd?: string;
  readonly timeoutMs?: number;
}

export class GitDetector implements ICapabilityDetector {
  readonly detectorName = 'GitDetector';
  private readonly cwd: string;
  private readonly timeoutMs: number;

  constructor(options: GitDetectorOptions = {}) {
    this.cwd = options.cwd || process.cwd();
    this.timeoutMs = options.timeoutMs || 3000;
  }

  async detect(): Promise<readonly VerificationCapabilityDetectionResult[]> {
    try {
      const branch = execSync('git branch --show-current', {
        cwd: this.cwd,
        timeout: this.timeoutMs,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();

      const remoteRaw = execSync('git remote -v', {
        cwd: this.cwd,
        timeout: this.timeoutMs,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();

      const remotes = remoteRaw
        .split('\n')
        .filter(Boolean)
        .map((line) => line.split(/\s+/)[0])
        .filter((value, index, self) => self.indexOf(value) === index);

      return Object.freeze([
        {
          type: VerificationCapabilityType.GIT_ACCESS,
          status: VerificationCapabilityStatus.AVAILABLE,
          permission: 'READ_WRITE',
          metadata: {
            branch: branch || 'HEAD',
            remotes,
            cwd: this.cwd
          }
        }
      ]);
    } catch (err: any) {
      return Object.freeze([
        {
          type: VerificationCapabilityType.GIT_ACCESS,
          status: VerificationCapabilityStatus.UNAVAILABLE,
          error: err.message || 'Git environment detection failed',
          metadata: {
            cwd: this.cwd,
            reason: err.message || 'Not a git repository or git executable missing'
          }
        }
      ]);
    }
  }
}
