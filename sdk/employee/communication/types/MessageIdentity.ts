export interface MessageIdentity {
  messageId: string;
  conversationId: string;
  parentMessageId?: string;
  threadId?: string;
  createdAt: string;
  senderEmployeeId: string;
}
