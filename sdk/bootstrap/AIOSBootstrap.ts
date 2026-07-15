import { IAIOSBootstrap, IAIOSPluginManager } from '../contracts';
import { PluginManager } from '../plugin/PluginManager';
import { IAIOSPlugin } from '../contracts';

export interface AIOSConfiguration {
  learning: boolean;
  knowledge: boolean;
  observability: boolean;
  execution: boolean;
  governance: boolean;
  plugins: IAIOSPlugin[];
}

export class AIOSBootstrap implements IAIOSBootstrap {
  public readonly pluginManager: IAIOSPluginManager;
  private readonly config: AIOSConfiguration;

  constructor(config: AIOSConfiguration) {
    this.config = config;
    const pm = new PluginManager();
    for (const p of config.plugins) {
        pm.register(p);
    }
    this.pluginManager = pm;
  }

  public async start(): Promise<void> {
    // Initialization sequence:
    // 1. Core OSes (Learning, Knowledge, Observability, Governance, Execution)
    // 2. Load plugins
    const context = {
        logger: {
            info: console.log,
            warn: console.warn,
            error: console.error
        }
    };
    for (const plugin of this.pluginManager.listPlugins()) {
      await this.pluginManager.load(plugin.manifest.pluginId);
    }
  }

  public async stop(): Promise<void> {
    for (const plugin of this.pluginManager.listPlugins()) {
      await this.pluginManager.unload(plugin.manifest.pluginId);
    }
  }

  public health(): Record<string, unknown> {
    return {
      status: 'OK',
      os: {
        learning: this.config.learning ? 'READY' : 'DISABLED',
        knowledge: this.config.knowledge ? 'READY' : 'DISABLED',
        observability: this.config.observability ? 'READY' : 'DISABLED',
        execution: this.config.execution ? 'READY' : 'DISABLED',
        governance: this.config.governance ? 'READY' : 'DISABLED',
      },
      pluginsCount: this.pluginManager.listPlugins().length
    };
  }
}
