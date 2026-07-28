/**
 * VerificationCapabilityDetector.ts
 * 
 * AIOS Verification Runtime Foundation - Capability Detector Interfaces
 * 
 * 個別の環境診断器（Detector）が遵守する純粋な検出インターフェース。
 * Detector 自体は Registry の状態を直接変更せず、診断結果（Result）のみを返す。
 */

import {
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from './VerificationCapabilityModel';

export interface VerificationCapabilityDetectionResult {
  readonly type: VerificationCapabilityType;
  readonly status: VerificationCapabilityStatus;
  readonly id?: string;
  readonly endpoint?: string;
  readonly permission?: string;
  readonly metadata?: Record<string, any>;
  readonly error?: string;
}

export interface ICapabilityDetector {
  /**
   * 検出器の名前
   */
  readonly detectorName: string;

  /**
   * 対象環境を診断し、能力検出結果を返却する
   * 例外を発生させず、非接続・失敗時も status = UNAVAILABLE の Result に変換する
   */
  detect(): Promise<readonly VerificationCapabilityDetectionResult[]>;
}
