/**
 * ExecutionPermissionGate.ts
 * 
 * AIOS Execution Permission Gate
 * 
 * AI 社員ごとの実行権限スコープ（READ_FILE, WRITE_FILE, EXECUTE_COMMAND, GIT_PUSH, BROWSER_ACTION, DEPLOY_PRODUCTION 等）
 * を一元管理し、危険操作や未許可スコープの実行を厳格に遮断・判定する。
 */

export enum ExecutionPermissionScope {
  READ_FILE = 'READ_FILE',
  WRITE_FILE = 'WRITE_FILE',
  EXECUTE_COMMAND = 'EXECUTE_COMMAND',
  GIT_COMMIT = 'GIT_COMMIT',
  GIT_PUSH = 'GIT_PUSH',
  BROWSER_ACTION = 'BROWSER_ACTION',
  DEPLOY_PRODUCTION = 'DEPLOY_PRODUCTION',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export interface PermissionCheckResult {
  readonly allowed: boolean;
  readonly reason?: string;
}

export class ExecutionPermissionGate {
  private static employeePermissions: Map<string, Set<ExecutionPermissionScope>> = new Map();

  /**
   * 指定した AI 社員に権限スコープを付与する
   */
  static grantPermission(employeeId: string, scope: ExecutionPermissionScope): void {
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('[ExecutionPermissionGate] employeeId is required');
    }

    let scopes = this.employeePermissions.get(employeeId);
    if (!scopes) {
      scopes = new Set();
      this.employeePermissions.set(employeeId, scopes);
    }
    scopes.add(scope);
  }

  /**
   * 指定した AI 社員に複数の権限スコープを一括付与する
   */
  static grantPermissions(employeeId: string, scopes: readonly ExecutionPermissionScope[]): void {
    for (const scope of scopes) {
      this.grantPermission(employeeId, scope);
    }
  }

  /**
   * 指定した AI 社員の権限スコープを剥奪する
   */
  static revokePermission(employeeId: string, scope: ExecutionPermissionScope): void {
    const scopes = this.employeePermissions.get(employeeId);
    if (scopes) {
      scopes.delete(scope);
    }
  }

  /**
   * 指定した AI 社員が対象権限スコープを保持しているか判定する
   */
  static checkPermission(employeeId: string, scope: ExecutionPermissionScope): PermissionCheckResult {
    const scopes = this.employeePermissions.get(employeeId);
    if (!scopes || !scopes.has(scope)) {
      return Object.freeze({
        allowed: false,
        reason: `[ExecutionPermissionGate] Permission DENIED for employee ${employeeId} on scope: ${scope}`
      });
    }

    return Object.freeze({
      allowed: true
    });
  }

  /**
   * 指定した AI 社員が保有する全権限スコープを取得する
   */
  static getPermissions(employeeId: string): readonly ExecutionPermissionScope[] {
    const scopes = this.employeePermissions.get(employeeId);
    if (!scopes) {
      return Object.freeze([]);
    }
    return Object.freeze(Array.from(scopes));
  }

  /**
   * 権限設定をクリアする（テスト用・初期化用）
   */
  static clearPermissions(employeeId?: string): void {
    if (employeeId) {
      this.employeePermissions.delete(employeeId);
    } else {
      this.employeePermissions.clear();
    }
  }
}
