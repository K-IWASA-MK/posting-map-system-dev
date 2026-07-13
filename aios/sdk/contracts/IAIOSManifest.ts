export interface PluginCapability {
  readonly type: string;
  readonly description: string;
}

export interface PluginMetadata {
  readonly author: string;
  readonly description: string;
  readonly homepage?: string;
  readonly license?: string;
}

export interface IAIOSManifest {
  readonly pluginId: string;
  readonly name: string;
  readonly version: string;
  readonly requiredAIOS: string;
  readonly permissions: ReadonlyArray<string>;
  readonly modules: ReadonlyArray<string>;
  readonly events: ReadonlyArray<string>;
  
  // Extensions
  readonly capabilities?: ReadonlyArray<PluginCapability>;
  readonly metadata?: PluginMetadata;
  readonly dependencies?: ReadonlyArray<{ pluginId: string, version: string }>;
}
