import { PredictionRegistry } from "./PredictionRegistry";
import { PredictionContext } from "./PredictionContext";
import { PredictionResult } from "./PredictionResult";
import { PredictionTarget } from "./PredictionTarget";

export class PredictionEngine {
  constructor(private registry: PredictionRegistry) {}

  public async generate(context: PredictionContext, historyData: any[], target: PredictionTarget): Promise<PredictionResult[]> {
    const models = this.registry.resolve(target);
    const results: PredictionResult[] = [];
    
    for (const model of models) {
      const result = await model.predict(context, historyData);
      if (result) results.push(result);
    }
    return results;
  }
}
