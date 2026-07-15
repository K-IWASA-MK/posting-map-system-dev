import { IClock } from './IClock';

/**
 * SystemClock implements real clock time queries using Date.now().
 */
export class SystemClock implements IClock {
  public now(): number {
    return Date.now();
  }
}
