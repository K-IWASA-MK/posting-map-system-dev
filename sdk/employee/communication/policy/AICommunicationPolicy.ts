import { AICommunicationSizeExceededException } from '../exceptions/AICommunicationExceptions';

export class AICommunicationPolicy {
  public static readonly MAX_MESSAGE_SIZE_BYTES = 65536; // 64KB
  public static readonly MAX_RPC_TIMEOUT_MS = 30000;      // 30s
  public static readonly MAX_RETRY_COUNT = 3;
  public static readonly MAX_BROADCAST_TARGETS = 50;

  public static validateMessageSize(body: any): void {
    const size = Buffer.byteLength(JSON.stringify(body || {}));
    if (size > AICommunicationPolicy.MAX_MESSAGE_SIZE_BYTES) {
      throw new AICommunicationSizeExceededException(`Message body size of ${size} bytes exceeds max allowed ${AICommunicationPolicy.MAX_MESSAGE_SIZE_BYTES} bytes.`);
    }
  }
}
