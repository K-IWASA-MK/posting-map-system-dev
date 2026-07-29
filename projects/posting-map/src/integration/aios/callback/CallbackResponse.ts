/**
 * CallbackResponse.ts
 * Standard HTTP-agnostic response model for AIOS Callback.
 */

export interface CallbackResponse {
  readonly statusCode: number;
  readonly accepted: boolean;
  readonly receivedAt: Date;
  readonly requestId: string;
  readonly message: string;
}
