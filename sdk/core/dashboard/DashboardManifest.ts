import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';

export interface DashboardConfiguration extends RuntimeConfiguration {
  port: number;
  apiPrefix: string;
  enableCors: boolean;
  corsAllowedOrigins?: string[];
  maxEventsRetention: number;
}

export interface DashboardManifest extends RuntimeManifest {
  dashboardId: string;
  configuration: DashboardConfiguration;
  lifecyclePolicy: RuntimePolicy;
}
