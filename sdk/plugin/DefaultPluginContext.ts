import { PluginContext, PluginLogger, PluginEventBus } from '../contracts';

export class DefaultPluginContext implements PluginContext {
  constructor(
    public readonly pluginId: string,
    public readonly logger: PluginLogger,
    public readonly events: PluginEventBus,
    private readonly configuration: Record<string, unknown>,
    private readonly services: Map<string, unknown>
  ) {}

  public getConfig<T>(key: string): T | undefined {
    return this.configuration[key] as T | undefined;
  }

  public getService<T>(serviceName: string): T | undefined {
    return this.services.get(serviceName) as T | undefined;
  }
}
