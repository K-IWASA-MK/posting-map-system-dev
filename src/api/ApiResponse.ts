export class ApiResponse {
  public readonly status: number;
  public readonly success: boolean;
  public readonly data: any;
  public readonly error: { code: string; message: string } | null;
  public readonly metadata: {
    requestId: string;
    serverTimestamp: number;
    processingTime: number;
    version: string;
  };

  constructor(params: {
    status: number;
    success: boolean;
    data?: any;
    error?: { code: string; message: string } | null;
    metadata: {
      requestId: string;
      serverTimestamp: number;
      processingTime: number;
      version: string;
    };
  }) {
    this.status = params.status;
    this.success = params.success;
    this.data = params.data || null;
    this.error = params.error || null;
    this.metadata = params.metadata;
  }

  public static successResponse(data: any, status: number, metadata: any): ApiResponse {
    return new ApiResponse({
      status,
      success: true,
      data,
      metadata
    });
  }

  public static errorResponse(code: string, message: string, status: number, metadata: any): ApiResponse {
    return new ApiResponse({
      status,
      success: false,
      error: { code, message },
      metadata
    });
  }
}
