import { EventEnvelope } from '../eventbus/EventEnvelope';

export interface IProjectionBuilder {
  build(envelope: EventEnvelope): Promise<void>;
}
