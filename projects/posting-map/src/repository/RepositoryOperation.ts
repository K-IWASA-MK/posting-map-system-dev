export enum RepositoryOperationType {
  UPSERT = 'UPSERT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SOFT_DELETE = 'SOFT_DELETE'
}

export interface RepositoryOperation {
  operationType: RepositoryOperationType;
  targetId: string;
  timestamp: Date;
  payload: unknown;
}
