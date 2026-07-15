import { RuntimeEvent } from './RuntimeEvent';

/**
 * RuntimeEventListener type alias defines functions subscribing to events.
 */
export type RuntimeEventListener<T = unknown> = (event: RuntimeEvent<T>) => void;
