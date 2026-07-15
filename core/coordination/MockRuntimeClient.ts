import { RuntimeQueryEngine } from "./RuntimeQueryEngine";
import { RuntimeResponse } from "./RuntimeResponse";

export class MockRuntimeClient implements RuntimeQueryEngine {
  async queryAll(traceId: string): Promise<RuntimeResponse[]> {
    if (traceId === "ERROR") throw new Error("Runtime Query Error");
    
    return [
      {
        runtimeId: "PREDICTIVE",
        status: "ONLINE",
        confidence: traceId === "RISK" ? 0.99 : 0.9,
        recommendation: traceId === "RISK" ? "CRITICAL: Stop routing" : "Normal forecast",
        latency: 10,
        timestamp: Date.now(),
        traceId
      },
      {
        runtimeId: "POLICY",
        status: "ONLINE",
        confidence: 0.9,
        recommendation: "Apply Balanced Profile",
        latency: 5,
        timestamp: Date.now(),
        traceId
      }
    ];
  }
}
