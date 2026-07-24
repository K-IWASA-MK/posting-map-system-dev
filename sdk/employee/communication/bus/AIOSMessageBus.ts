import { AIMessage } from '../types/AIMessage';
import { DeliveryStatus } from '../types/DeliveryStatus';
import { AICommunicationPolicy } from '../policy/AICommunicationPolicy';
import { DeadLetterQueue } from '../dlq/DeadLetterQueue';

export type MessageHandler = (message: AIMessage) => Promise<void>;

export class AIOSMessageBus {
  private handlers: Map<string, MessageHandler[]> = new Map();
  private deadLetterQueue: DeadLetterQueue = new DeadLetterQueue();
  private deliveredCount: number = 0;

  public subscribe(channelId: string, handler: MessageHandler): void {
    const list = this.handlers.get(channelId) || [];
    list.push(handler);
    this.handlers.set(channelId, list);
  }

  public async publish(channelId: string, message: AIMessage): Promise<boolean> {
    AICommunicationPolicy.validateMessageSize(message.body);
    message.deliveryStatus = DeliveryStatus.SENT;

    const list = this.handlers.get(channelId);
    if (!list || list.length === 0) {
      this.deadLetterQueue.push(message);
      return false;
    }

    try {
      for (const handler of list) {
        await handler(message);
      }
      message.deliveryStatus = DeliveryStatus.DELIVERED;
      this.deliveredCount++;
      return true;
    } catch (err) {
      this.deadLetterQueue.push(message);
      return false;
    }
  }

  public getDLQ(): DeadLetterQueue {
    return this.deadLetterQueue;
  }

  public getDeliveredCount(): number {
    return this.deliveredCount;
  }
}
