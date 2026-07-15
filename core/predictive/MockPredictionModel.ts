import { PredictionModel } from "./PredictionModel";
import { PredictionContext } from "./PredictionContext";
import { PredictionResult } from "./PredictionResult";
import { PredictionTarget } from "./PredictionTarget";

export class MockPredictionModel implements PredictionModel {
  constructor(public readonly target: PredictionTarget) {}
  
  async predict(context: PredictionContext, historyData: any[]): Promise<PredictionResult | null> {
    // Generate mock prediction based on context for testing
    let confidence = 0.9;
    let risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    
    if (context.dataQuality < 0.5) confidence = 0.3; // Low confidence for Scenario 3
    if (context.environmentVector.eventDensity > 0.8) {
      risk = "HIGH"; // High risk event for Scenario 2
    }
    
    return {
      target: this.target,
      predictedValue: 100, // Mock value
      confidence,
      risk,
      recommendation: "Scale resources",
      traceId: context.traceId
    };
  }
}
