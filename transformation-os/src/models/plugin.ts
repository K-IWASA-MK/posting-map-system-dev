export type PluginId = string;
export type PluginVersion = string;
export type ApiVersion = string;

export type PluginKind =
  | 'WORKER'
  | 'PROJECTOR'
  | 'RULESET'
  | 'PLANNER'
  | 'PUBLISHER'
  | 'STORAGE'
  | 'METRICS'
  | 'SECURITY';

export enum PluginCapability {
  EXECUTE = 'EXECUTE',
  PROJECT = 'PROJECT',
  VALIDATE = 'VALIDATE',
  PLAN = 'PLAN',
  PUBLISH = 'PUBLISH',
  STORE = 'STORE',
  METRICS = 'METRICS',
  SECURITY = 'SECURITY'
}

export enum PluginOrigin {
  CORE = 'CORE',
  LOCAL = 'LOCAL',
  MARKETPLACE = 'MARKETPLACE',
  REMOTE = 'REMOTE'
}

export type PluginState = 
  | 'DISCOVERED'
  | 'TRUSTED'
  | 'ACTIVATING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'UNLOADED'
  | 'FAILED';

export interface PluginManifest {
  readonly pluginId: PluginId;
  readonly name: string;
  readonly version: PluginVersion;
  readonly minimumApiVersion: ApiVersion;
  readonly maximumApiVersion: ApiVersion;
  readonly kind: PluginKind;
  readonly capabilities: readonly PluginCapability[];
  readonly signature?: string;
  readonly checksum?: string;
}

export interface PluginDescriptor {
  readonly manifest: PluginManifest;
  readonly state: PluginState;
  readonly origin: PluginOrigin;
  readonly installedAt: string;
  readonly loadedAt?: string;
}

export interface IPlugin {
  readonly descriptor: PluginDescriptor;
}
