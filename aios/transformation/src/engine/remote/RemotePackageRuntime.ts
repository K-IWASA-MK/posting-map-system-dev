import { IPackageCache, IPackageDownloader } from './interfaces';
import { DownloadedPlugin, RemotePackage } from './models';

export class RemotePackageRuntime {
  constructor(
    private readonly cache: IPackageCache,
    private readonly downloader: IPackageDownloader
  ) {}

  /**
   * Coordinator logic: Cache -> Downloader -> Integrity Attach -> DownloadedPlugin
   */
  async getPackage(remote: RemotePackage): Promise<DownloadedPlugin> {
    // 1. Check Cache (Cache Hit avoids download)
    const cached = await this.cache.get(remote.pluginId, remote.version);
    if (cached) {
      return cached;
    }

    // 2. Download (Transport, Retry, Mirror hidden inside Downloader)
    const session = await this.downloader.startDownload({ package: remote });
    const archive = await this.downloader.finalize(session);

    // 3. Attach Integrity Metadata (No Verification in X-27)
    const plugin: DownloadedPlugin = {
      pluginId: remote.pluginId,
      version: remote.version,
      archive,
      integrity: {
        checksumRef: remote.checksumRef,
        signatureRef: remote.signatureRef
      },
      downloadedAt: new Date().toISOString()
    };

    // 4. Cache and Return
    await this.cache.put(plugin);
    return plugin;
  }
}
