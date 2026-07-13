export class ValidationEventBus {
  private listeners: Map<string, Function[]> = new Map();

  public subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public publish(event: string, payload: any): void {
    const callbacks = this.listeners.get(event) || [];
    for (const cb of callbacks) {
      cb(payload);
    }
  }
}

export enum ValidationEvents {
  ValidationPlanCreated = 'ValidationPlanCreated',
  ValidatorInitialized = 'ValidatorInitialized',
  ValidationStarted = 'ValidationStarted',
  ValidatorCompleted = 'ValidatorCompleted',
  ValidationCompleted = 'ValidationCompleted',
  EvidenceCollected = 'EvidenceCollected',
  ValidationScored = 'ValidationScored',
  ScoreCalculated = 'ScoreCalculated',
  AggregationStarted = 'AggregationStarted',
  AggregationCompleted = 'AggregationCompleted',
  VerificationCompleted = 'VerificationCompleted',
  ValidationRetrying = 'ValidationRetrying',
  ValidationTimeout = 'ValidationTimeout',
  ValidationCancelled = 'ValidationCancelled',
  ValidationFailed = 'ValidationFailed',
  ValidationArchived = 'ValidationArchived'
}
