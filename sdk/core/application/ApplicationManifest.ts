import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';
import { ApplicationSignature, ApplicationProfile } from './ApplicationModels';

export interface ApplicationManifest extends RuntimeManifest {
  readonly signature: ApplicationSignature;
  readonly profile: ApplicationProfile;
  readonly workflows: string[];
  readonly services: string[];
  readonly configuration: RuntimeConfiguration;
  readonly lifecyclePolicy: RuntimePolicy;
}
