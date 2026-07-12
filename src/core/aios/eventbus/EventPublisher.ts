import { IEventPublisher } from './IEventPublisher';
import { IEventBus } from './IEventBus';
import { EventEnvelope } from './EventEnvelope';
import { EventDispatchResult } from './EventDispatchResult';

export class EventPublisher implements IEventPublisher {
  private eventBus: IEventBus;

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
  }

  public async publish(envelope: EventEnvelope): Promise<EventDispatchResult> {
    return await this.eventBus.publish(envelope);
  }

  public async publishBatch(envelopes: EventEnvelope[]): Promise<EventDispatchResult[]> {
    const results: EventDispatchResult[] = [];
    for (const env of envelopes) {
      const res = await this.publish(env);
      results.push(res);
    }
    return results;
  }
}
