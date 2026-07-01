export interface APIEndpoint {
  path: string;
  method: string;
  parameters: Record<string, any>[];
  requestBody: Record<string, any>;
  responseBody: Record<string, any>;
  responseSchemaVersion?: string;
  errorSchema?: Record<string, any>;
}
