import { PredictionModel } from "./PredictionModel";
import { PredictionTarget } from "./PredictionTarget";

export class PredictionRegistry {
  private models: Map<PredictionTarget, PredictionModel[]> = new Map();

  public register(model: PredictionModel): void {
    if (!this.models.has(model.target)) {
      this.models.set(model.target, []);
    }
    this.models.get(model.target)!.push(model);
  }

  public resolve(target: PredictionTarget): PredictionModel[] {
    return this.models.get(target) || [];
  }

  public unregister(model: PredictionModel): void {
    const models = this.models.get(model.target) || [];
    this.models.set(model.target, models.filter(m => m !== model));
  }

  public list(): PredictionModel[] {
    return Array.from(this.models.values()).flat();
  }
}
