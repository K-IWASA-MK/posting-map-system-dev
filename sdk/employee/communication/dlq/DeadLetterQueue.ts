import { AIMessage } from '../types/AIMessage';
import { DeliveryStatus } from '../types/DeliveryStatus';

export class DeadLetterQueue {
  private dlqMessages: Map<string, AIMessage> = new Map();

  public push(message: AIMessage): void {
    message.deliveryStatus = DeliveryStatus.FAILED;
    this.dlqMessages.set(message.identity.messageId, message);
  }

  public getMessages(): AIMessage[] {
    return Array.from(this.dlqMessages.values());
  }

  public retryMessage(messageId: string): AIMessage | undefined {
    const msg = this.dlqMessages.get(messageId);
    if (msg) {
      msg.retryAttempts++;
      msg.deliveryStatus = DeliveryStatus.SENT;
      this.dlqMessages.delete(messageId);
    }
    return msg;
  }

  public size(): number {
    return this.dlqMessages.size;
  }
}
