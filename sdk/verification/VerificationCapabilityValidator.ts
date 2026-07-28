/**
 * VerificationCapabilityValidator.ts
 * 
 * Verification Capability Model バリデータ
 * 
 * 不変オブジェクトの完全性・妥当性を検証する。
 */

import {
  VerificationCapability,
  VerificationCapabilitySnapshot,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from './VerificationCapabilityModel';

export class VerificationCapabilityValidator {
  /**
   * 単一の VerificationCapability が正当かを検証する
   */
  static validateCapability(capability: unknown): capability is VerificationCapability {
    if (!capability || typeof capability !== 'object') {
      return false;
    }

    const cap = capability as Record<string, any>;

    if (typeof cap.id !== 'string' || cap.id.trim() === '') {
      return false;
    }

    if (!Object.values(VerificationCapabilityType).includes(cap.type)) {
      return false;
    }

    if (!Object.values(VerificationCapabilityStatus).includes(cap.status)) {
      return false;
    }

    if (typeof cap.lastChecked !== 'string' || Number.isNaN(Date.parse(cap.lastChecked))) {
      return false;
    }

    if (cap.endpoint !== undefined && typeof cap.endpoint !== 'string') {
      return false;
    }

    if (cap.permission !== undefined && typeof cap.permission !== 'string') {
      return false;
    }

    if (cap.metadata !== undefined && (typeof cap.metadata !== 'object' || cap.metadata === null)) {
      return false;
    }

    return true;
  }

  /**
   * VerificationCapabilitySnapshot 全体が正当かを検証する
   */
  static validateSnapshot(snapshot: unknown): snapshot is VerificationCapabilitySnapshot {
    if (!snapshot || typeof snapshot !== 'object') {
      return false;
    }

    const snap = snapshot as Record<string, any>;

    if (typeof snap.snapshotId !== 'string' || snap.snapshotId.trim() === '') {
      return false;
    }

    if (typeof snap.timestamp !== 'string' || Number.isNaN(Date.parse(snap.timestamp))) {
      return false;
    }

    if (!['READY', 'PARTIAL', 'UNAVAILABLE'].includes(snap.overallStatus)) {
      return false;
    }

    if (!Array.isArray(snap.capabilities)) {
      return false;
    }

    return snap.capabilities.every((cap) => this.validateCapability(cap));
  }
}
