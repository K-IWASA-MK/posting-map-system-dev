import { PluginManifest, PluginId, PluginVersion } from '../../../models/plugin';

/**
 * MarketplacePackage
 * 
 * Represents a plugin's metadata as provided by a Marketplace Provider.
 * This is a Marketplace domain model, NOT a Discovery domain model.
 */
export interface MarketplacePackage {
  /**
   * The core plugin manifest.
   */
  readonly manifest: PluginManifest;

  /**
   * The identifier of the publisher who published this package.
   */
  readonly publisherId: string;

  /**
   * The license under which this package is distributed (e.g., 'MIT', 'Proprietary').
   */
  readonly license: string;

  /**
   * URL to the homepage of the plugin.
   */
  readonly homepage?: string;

  /**
   * URL to the source code repository of the plugin.
   */
  readonly repository?: string;

  /**
   * URL to the documentation of the plugin.
   */
  readonly documentation?: string;

  /**
   * The release date of this specific version.
   */
  readonly releaseDate: string;

  /**
   * Reference (URI/URL) to the cryptographic signature of the package.
   * The actual signature is NOT held in memory here.
   */
  readonly signatureRef?: string;

  /**
   * Reference (URI/URL) to the checksum of the package.
   * The actual checksum is NOT held in memory here.
   */
  readonly checksumRef?: string;
}

/**
 * MarketplaceQuery
 * 
 * Represents search criteria to be sent to a Marketplace Provider.
 */
export interface MarketplaceQuery {
  readonly query?: string;
  readonly kind?: string;
  readonly tags?: readonly string[];
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * PluginArchive
 * 
 * Represents the raw, downloaded bytes of a plugin package.
 */
export interface PluginArchive {
  readonly data: Uint8Array;
  readonly size: number;
}

/**
 * DownloadedPlugin
 * 
 * Represents a successfully downloaded plugin package from a Marketplace.
 */
export interface DownloadedPlugin {
  readonly pluginId: PluginId;
  readonly version: PluginVersion;
  readonly archive: PluginArchive;
  readonly downloadedAt: string;
}
