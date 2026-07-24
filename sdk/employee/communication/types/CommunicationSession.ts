export interface CommunicationSession {
  sessionId: string;
  conversationId: string;
  participants: string[];
  startedAt: number;
  expiresAt: number;
  active: boolean;
}
