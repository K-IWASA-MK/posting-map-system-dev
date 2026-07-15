export interface IEventIdProvider {
  nextId(): string;
}

export class DefaultEventIdProvider implements IEventIdProvider {
  public nextId(): string {
    return `EVT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }
}
