/**
 * FilesystemDetector.ts
 * 
 * ワークスペースファイルシステム読み書き・差分検証判定器
 */

import fs from 'fs';
import path from 'path';
import {
  ICapabilityDetector,
  VerificationCapabilityDetectionResult
} from '../VerificationCapabilityDetector';
import {
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../VerificationCapabilityModel';

export interface FilesystemDetectorOptions {
  readonly workspacePath?: string;
}

export class FilesystemDetector implements ICapabilityDetector {
  readonly detectorName = 'FilesystemDetector';
  private readonly workspacePath: string;

  constructor(options: FilesystemDetectorOptions = {}) {
    this.workspacePath = options.workspacePath || process.cwd();
  }

  async detect(): Promise<readonly VerificationCapabilityDetectionResult[]> {
    try {
      let readable = false;
      let writable = false;

      try {
        fs.accessSync(this.workspacePath, fs.constants.R_OK);
        readable = true;
      } catch {
        readable = false;
      }

      try {
        fs.accessSync(this.workspacePath, fs.constants.W_OK);
        writable = true;
      } catch {
        writable = false;
      }

      if (!readable) {
        return Object.freeze([
          {
            type: VerificationCapabilityType.FILE_ACCESS,
            status: VerificationCapabilityStatus.UNAVAILABLE,
            error: 'Workspace is not readable',
            metadata: { workspacePath: this.workspacePath, readable: false, writable: false }
          }
        ]);
      }

      const status = writable ? VerificationCapabilityStatus.AVAILABLE : VerificationCapabilityStatus.DEGRADED;

      return Object.freeze([
        {
          type: VerificationCapabilityType.FILE_ACCESS,
          status,
          permission: writable ? 'READ_WRITE' : 'READ_ONLY',
          metadata: {
            workspacePath: this.workspacePath,
            readable,
            writable,
            diffCapable: true
          }
        }
      ]);
    } catch (err: any) {
      return Object.freeze([
        {
          type: VerificationCapabilityType.FILE_ACCESS,
          status: VerificationCapabilityStatus.UNAVAILABLE,
          error: err.message || 'Filesystem detection error',
          metadata: { workspacePath: this.workspacePath, reason: err.message }
        }
      ]);
    }
  }
}
