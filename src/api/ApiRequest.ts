export class ApiRequest {
  public readonly method: string;
  public readonly path: string;
  public readonly version: string;
  public readonly query: Record<string, any>;
  public readonly body: Record<string, any>;
  public readonly headers: Record<string, any>;
  public readonly requestId: string;

  constructor(params: {
    method: string;
    path: string;
    version: string;
    query?: Record<string, any>;
    body?: Record<string, any>;
    headers?: Record<string, any>;
    requestId: string;
  }) {
    this.method = params.method.toUpperCase();
    this.path = params.path;
    this.version = params.version.toLowerCase();
    this.query = params.query || {};
    this.body = params.body || {};
    this.headers = params.headers || {};
    this.requestId = params.requestId;
  }
}
