import { RuntimeResponse } from "./RuntimeResponse";

export interface RuntimeQueryEngine {
  queryAll(traceId: string): Promise<RuntimeResponse[]>;
}
