/**
 * CapabilityMappingRegistry.ts
 * 
 * AIOS Capability & Permission Mapping Registry
 * 
 * AI社員タイプ（AGENT, SUPERVISOR, SYSTEM等）や個別の社員IDと、
 * AIOS Verification Runtime の VerificationCapability および ExecutionPermissionGate の
 * ExecutionPermissionScope とのマッピングを一元管理する。
 */

import { ExecutionPermissionScope } from '../../execution/ExecutionPermissionGate';
import {
  VerificationCapability,
  VerificationCapabilityFactory,
  VerificationCapabilityStatus,
  VerificationCapabilityType
} from '../../verification';

export interface EmployeeCapabilityMapping {
  readonly capabilities: readonly VerificationCapability[];
  readonly permissions: readonly ExecutionPermissionScope[];
}

export class CapabilityMappingRegistry {
  private static mappings: Map<string, EmployeeCapabilityMapping> = new Map();

  /**
   * 社員タイプまたは社員IDに対する能力・権限マッピングを登録する
   */
  static registerMapping(
    key: string,
    capabilities: readonly VerificationCapability[],
    permissions: readonly ExecutionPermissionScope[]
  ): void {
    this.mappings.set(key, Object.freeze({
      capabilities: Object.freeze([...capabilities]),
      permissions: Object.freeze([...permissions])
    }));
  }

  /**
   * マッピングを取得する
   */
  static getMapping(key: string): EmployeeCapabilityMapping | undefined {
    return this.mappings.get(key);
  }

  /**
   * デフォルトの能力・権限マッピングを提供する
   */
  static getDefaultMapping(employeeType: string): EmployeeCapabilityMapping {
    const existing = this.getMapping(employeeType);
    if (existing) {
      return existing;
    }

    // デフォルトプロファイル
    if (employeeType === 'SUPERVISOR' || employeeType === 'SYSTEM') {
      return Object.freeze({
        capabilities: Object.freeze([
          VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.GIT_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
          VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.FILE_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
          VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.BROWSER_AUTOMATION, status: VerificationCapabilityStatus.AVAILABLE }),
          VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.API_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
          VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.DEPLOYMENT_STATUS, status: VerificationCapabilityStatus.AVAILABLE })
        ]),
        permissions: Object.freeze([
          ExecutionPermissionScope.READ_FILE,
          ExecutionPermissionScope.WRITE_FILE,
          ExecutionPermissionScope.EXECUTE_COMMAND,
          ExecutionPermissionScope.GIT_COMMIT,
          ExecutionPermissionScope.GIT_PUSH,
          ExecutionPermissionScope.BROWSER_ACTION,
          ExecutionPermissionScope.DEPLOY_PRODUCTION,
          ExecutionPermissionScope.SYSTEM_ADMIN
        ])
      });
    }

    // Standard AGENT default profile
    return Object.freeze({
      capabilities: Object.freeze([
        VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.GIT_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
        VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.FILE_ACCESS, status: VerificationCapabilityStatus.AVAILABLE }),
        VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.BROWSER_AUTOMATION, status: VerificationCapabilityStatus.AVAILABLE }),
        VerificationCapabilityFactory.createCapability({ type: VerificationCapabilityType.API_ACCESS, status: VerificationCapabilityStatus.AVAILABLE })
      ]),
      permissions: Object.freeze([
        ExecutionPermissionScope.READ_FILE,
        ExecutionPermissionScope.WRITE_FILE,
        ExecutionPermissionScope.GIT_COMMIT,
        ExecutionPermissionScope.BROWSER_ACTION
      ])
    });
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.mappings.clear();
  }
}
