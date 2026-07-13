import { FeedbackSignal } from "./FeedbackSignal";

export class StabilizationRegistry {
  private signals: Map<string, FeedbackSignal> = new Map();

  public async registerSignal(signal: FeedbackSignal): Promise<boolean> {
    if (this.signals.has(signal.signalId)) {
      return false;
    }
    this.signals.set(signal.signalId, signal);
    return true;
  }

  public async findSignal(id: string): Promise<FeedbackSignal | null> {
    return this.signals.get(id) || null;
  }

  public async listSignals(): Promise<FeedbackSignal[]> {
    return Array.from(this.signals.values());
  }

  public async removeSignal(id: string): Promise<boolean> {
    return this.signals.delete(id);
  }
}
