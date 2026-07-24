export class AICommunicationException extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AICommunicationException';
  }
}

export class AICommunicationSizeExceededException extends AICommunicationException {
  constructor(message: string) {
    super(message, 'MESSAGE_SIZE_EXCEEDED');
    this.name = 'AICommunicationSizeExceededException';
  }
}

export class RPCTimeoutException extends AICommunicationException {
  constructor(message: string) {
    super(message, 'RPC_TIMEOUT');
    this.name = 'RPCTimeoutException';
  }
}

export class MessageDeliveryFailedException extends AICommunicationException {
  constructor(message: string) {
    super(message, 'DELIVERY_FAILED');
    this.name = 'MessageDeliveryFailedException';
  }
}
