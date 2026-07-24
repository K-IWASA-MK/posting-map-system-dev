import { AIMessage } from '../types/AIMessage';

export interface CommunicationEvent {
  type: string;
  timestamp: string;
  payload: any;
}

export class MessageSentEvent implements CommunicationEvent {
  type = 'MessageSent';
  timestamp = new Date().toISOString();
  constructor(public payload: { message: AIMessage }) {}
}

export class MessageDeliveredEvent implements CommunicationEvent {
  type = 'MessageDelivered';
  timestamp = new Date().toISOString();
  constructor(public payload: { messageId: string; receiverId: string }) {}
}

export class RPCRequestedEvent implements CommunicationEvent {
  type = 'RPCRequested';
  timestamp = new Date().toISOString();
  constructor(public payload: { requestId: string; senderId: string; targetId: string }) {}
}

export class RPCRespondedEvent implements CommunicationEvent {
  type = 'RPCResponded';
  timestamp = new Date().toISOString();
  constructor(public payload: { requestId: string; responderId: string; durationMs: number }) {}
}
