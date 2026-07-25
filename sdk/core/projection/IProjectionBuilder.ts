import { AIOSEvent } from '../event/AIOSEvent';

export interface IProjectionBuilder {
  build(event: AIOSEvent): Promise<void>;
}

