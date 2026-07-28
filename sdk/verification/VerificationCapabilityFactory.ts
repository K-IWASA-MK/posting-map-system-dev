/**
 * VerificationCapabilityFactory.ts
 * 
 * Verification Capability ファクトリ
 * 
 * 不変な VerificationCapability および VerificationCapabilitySnapshot を安全に生成する。
 */

import {
  VerificationCapability,
  VerificationCapabilityOverallStatus,
  VerificationCapabilitySnapshot,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from './VerificationCapabilityModel';
import { VerificationCapabilityValidator } from './VerificationCapabilityValidator';

export interface CreateCapabilityParams {
  id?: string;
  type: VerificationCapabilityType;
  status: VerificationCapabilityStatus;
  endpoint?: string;
  permission?: string;
  lastChecked?: string;
  metadata?: Record<string, any>;
}

export interface CreateSnapshotParams {
  snapshotId?: string;
  capabilities: readonly VerificationCapability[];
  timestamp?: string;
}

export class VerificationCapabilityFactory {
  /**
   * 不変な VerificationCapability を生成する
   */
  static createCapability(params: CreateCapabilityParams): VerificationCapability {
    const id = params.id || `cap-${params.type.toLowerCase().replace(/_/g, '-')}-${Date.now()}`;
    const lastChecked = params.lastChecked || new Date().toISOString();

    const capability: VerificationCapability = Object.freeze({
      id,
      type: params.type,
      status: params.status,
      ...(params.endpoint ? { endpoint: params.endpoint } : {}),
      ...(params.permission ? { permission: params.permission } : {}),
      lastChecked,
      ...(params.metadata ? { metadata: Object.freeze({ ...params.metadata }) } : {})
    });

    if (!VerificationCapabilityValidator.validateCapability(capability)) {
      throw new Error(`[VerificationCapabilityFactory] Invalid capability parameters for type: ${params.type}`);
    }

    return capability;
  }

  /**
   * 能力リストから不変な VerificationCapabilitySnapshot を生成する
   */
  static createSnapshot(params: CreateSnapshotParams): VerificationCapabilitySnapshot {
    const snapshotId = params.snapshotId || `snap-cap-${Date.now()}`;
    const timestamp = params.timestamp || new Date().toISOString();

    const capabilities = Object.freeze([...(params.capabilities || [])]);
    const overallStatus = this.calculateOverallStatus(capabilities);

    const snapshot: VerificationCapabilitySnapshot = Object.freeze({
      snapshotId,
      timestamp,
      capabilities,
      overallStatus
    });

    if (!VerificationCapabilityValidator.validateSnapshot(snapshot)) {
      throw new Error(`[VerificationCapabilityFactory] Invalid snapshot parameters for ID: ${snapshotId}`);
    }

    return snapshot;
  }

  /**
   * 全体ステータスを自動算出する
   */
  private static calculateOverallStatus(
    capabilities: readonly VerificationCapability[]
  ): VerificationCapabilityOverallStatus {
    if (capabilities.length === 0) {
      return 'UNAVAILABLE';
    }

    const availableCount = capabilities.filter(
      (c) => c.status === VerificationCapabilityStatus.AVAILABLE
    ).length;
    const degradedCount = capabilities.filter(
      (c) => c.status === VerificationCapabilityStatus.DEGRADED
    ).length;

    if (availableCount === capabilities.length) {
      return 'READY';
    }

    if (availableCount > 0 || degradedCount > 0) {
      return 'PARTIAL';
    }

    return 'UNAVAILABLE';
  }
}
