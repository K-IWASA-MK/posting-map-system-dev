import { ExceptionCategory } from './ExceptionCategory';
import { ExceptionMetadata } from './ExceptionMetadata';

export abstract class ApiException extends Error {
  public abstract readonly category: ExceptionCategory;
  public abstract readonly code: string;
  public abstract readonly status: number;
  public readonly internalMessage: string;
  public readonly externalMessage: string;
  public readonly metadata: ExceptionMetadata;

  constructor(params: {
    internalMessage: string;
    externalMessage: string;
    metadata: ExceptionMetadata;
  }) {
    super(params.internalMessage);
    this.name = this.constructor.name;
    this.internalMessage = params.internalMessage;
    this.externalMessage = params.externalMessage;
    this.metadata = params.metadata;

    // TypeScript/ES5 target hack to fix prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
