export interface ProjectionUpdateRequest {
  taskId: string;
  projectionType: string;
  payload: unknown;
  timestamp: Date;
}
