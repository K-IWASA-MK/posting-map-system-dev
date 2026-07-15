import { MarketplacePackage, MarketplaceQuery, DownloadedPlugin } from './models';
import { PluginId, PluginVersion } from '../../../models/plugin';

/**
 * IMarketplaceProvider
 * 
 * Port: Abstracts a specific Marketplace (e.g., Official Plugin Store, Enterprise Registry).
 * 
 * Responsibilities:
 * - Search for packages based on criteria.
 * - Retrieve detailed metadata for a specific package.
 * 
 * Constraints:
 * - MUST NOT download the package content.
 * - MUST NOT install, verify, register, or trust the package.
 */
export interface IMarketplaceProvider {
  /**
   * The unique name or identifier of this marketplace provider.
   */
  readonly providerName: string;

  /**
   * Searches the marketplace for packages matching the query.
   */
  search(query: MarketplaceQuery): Promise<readonly MarketplacePackage[]>;

  /**
   * Retrieves the detailed metadata for a specific plugin package.
   */
  getMetadata(pluginId: PluginId, version?: PluginVersion): Promise<MarketplacePackage | undefined>;
}

/**
 * IPackageDownloader
 * 
 * Port: Abstracts the fetching of the actual plugin package bytes.
 * 
 * Responsibilities:
 * - Download the plugin archive from a remote source.
 * 
 * Constraints:
 * - MUST return a DownloadedPlugin or PluginArchive.
 * - MUST NOT receive or leak MarketplacePackage to the PluginLoader.
 */
export interface IPackageDownloader {
  /**
   * Downloads the package archive.
   * @param sourceUri The URI indicating where to download the package from.
   */
  download(sourceUri: string): Promise<DownloadedPlugin>;
}
