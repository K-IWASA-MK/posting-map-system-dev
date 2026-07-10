/**
 * DashboardApiClient.ts
 * 
 * GAS Web App URL に対する HTTP / JSON 通信を行い、
 * 定義された API Schema の Request/Response ハンドリングを行う。
 */

export interface ApiRequest {
  readonly action: string;
  readonly params: Record<string, any>;
}

export interface ApiResponse<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: any;
  };
}

export class DashboardApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * GAS Web App にリクエストをPOST送信する
   */
  async request<T = any>(action: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'API Base URL is not configured.'
        }
      };
    }

    try {
      const payload: ApiRequest = { action, params };
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: `HTTP error: ${response.status} ${response.statusText}`
          }
        };
      }

      const result: ApiResponse<T> = await response.json();
      return result;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err.message || String(err)
        }
      };
    }
  }

  // 固有 API エンドポイントのヘルパーメソッド群

  async getDashboard(tenantId: string, branchId: string): Promise<ApiResponse> {
    return this.request('getDashboard', { tenantId, branchId });
  }

  async getAreas(tenantId: string, branchId: string): Promise<ApiResponse> {
    return this.request('getAreas', { tenantId, branchId });
  }

  async getVoteTurnout(areaId?: string): Promise<ApiResponse> {
    return this.request('getVoteTurnout', { areaId });
  }

  async getEventLog(limit?: number, sinceTimestamp?: number): Promise<ApiResponse> {
    return this.request('getEventLog', { limit, sinceTimestamp });
  }

  async getInventory(memberId?: string): Promise<ApiResponse> {
    return this.request('getInventory', { memberId });
  }

  async getMembers(lineUserId?: string): Promise<ApiResponse> {
    return this.request('getMembers', { lineUserId });
  }
}
