import { MessageIdentity } from './MessageIdentity';
import { DeliveryStatus } from './DeliveryStatus';
import { ChannelScope } from './ChannelScope';
import { MessagePriority } from './MessagePriority';

export interface AIMessage {
  identity: MessageIdentity;
  scope: ChannelScope;
  targetId?: string; // employeeId or teamId or departmentId
  priority: MessagePriority;
  deliveryStatus: DeliveryStatus;
  subject: string;
  body: any;
  retryAttempts: number;
}
