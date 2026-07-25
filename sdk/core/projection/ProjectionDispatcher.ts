import { AIOSEvent } from '../event/AIOSEvent';
import { IProjectionBuilder } from './IProjectionBuilder';

export class ProjectionDispatcher {
  private builder: IProjectionBuilder;

  constructor(builder: IProjectionBuilder) {
    this.builder = builder;
  }

  public async onEvent(event: AIOSEvent): Promise<void> {
    // Only process EXECUTION and SYSTEM events
    // (Mimicking supportsChannel logic by inspecting event properties if needed)
    await this.builder.build(event);
  }

  public priority(): number {
    return 90;
  }
}

