import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';

export interface ConsoleConfiguration extends RuntimeConfiguration {
  port: number;
  apiPrefix: string;
  enableCors: boolean;
  corsAllowedOrigins?: string[];
  maxEventsRetention: number;
}

export interface ConsoleManifest extends RuntimeManifest {
  consoleId: string;
  configuration: ConsoleConfiguration;
  lifecyclePolicy: RuntimePolicy;
}
