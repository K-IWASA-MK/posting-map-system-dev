import { DownloadRequest, DownloadSession, DownloadedPlugin, PluginArchive } from './models';

/**
 * IPackageDownloader
 * 
 * Port: Downloads packages, completely hiding Transport details (HTTP, S3, Git, etc).
 */
export interface IPackageDownloader {
  /**
   * Starts a new download session.
   */
  startDownload(request: DownloadRequest): Promise<DownloadSession>;

  /**
   * Resumes an existing download session.
   */
  resumeDownload(session: DownloadSession): Promise<DownloadSession>;

  /**
   * Converts a completed session into a PluginArchive.
   */
  finalize(session: DownloadSession): Promise<PluginArchive>;
}

/**
 * IPackageCache
 * 
 * Port: Stores ONLY DownloadedPlugin (Artifacts). Never RemotePackage.
 */
export interface IPackageCache {
  get(pluginId: string, version: string): Promise<DownloadedPlugin | undefined>;
  put(plugin: DownloadedPlugin): Promise<void>;
  has(pluginId: string, version: string): Promise<boolean>;
}

/**
 * ITransport
 * 
 * Port: Internal abstraction for the actual wire transfer (HTTP, S3, etc).
 * Isolated from the Loader and OS.
 */
export interface ITransport {
  readonly protocol: string; // e.g. "http", "https", "s3"
  fetch(uri: string, offset?: number): Promise<Uint8Array>;
}
