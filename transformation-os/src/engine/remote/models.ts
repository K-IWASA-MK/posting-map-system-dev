import { PluginId, PluginVersion } from '../../models/plugin';

/**
 * RemotePackage
 * 
 * Represents the network information required to locate and verify a plugin.
 * It is completely separate from the downloaded artifact.
 */
export interface RemotePackage {
  readonly pluginId: PluginId;
  readonly version: PluginVersion;
  readonly mirrors: readonly string[]; // e.g. ["https://cdn.example.com/plugin.zip", "s3://bucket/plugin.zip"]
  readonly checksumRef?: string;
  readonly signatureRef?: string;
}

/**
 * DownloadRequest
 * 
 * Instructions sent to the Downloader.
 */
export interface DownloadRequest {
  readonly package: RemotePackage;
  readonly timeoutMs?: number;
}

/**
 * DownloadSession
 * 
 * Represents an ongoing or paused download, enabling Resume capabilities.
 */
export interface DownloadSession {
  readonly sessionId: string;
  readonly request: DownloadRequest;
  readonly downloadedBytes: number;
  readonly totalBytes?: number; // Unknown if chunked without Content-Length
  readonly isComplete: boolean;
  readonly archiveData?: Uint8Array; // Partial or full data
}

/**
 * PluginArchive
 * 
 * The raw downloaded bytes of the plugin.
 */
export interface PluginArchive {
  readonly data: Uint8Array;
  readonly size: number;
}

/**
 * IntegrityMetadata
 * 
 * Holds references to the cryptographic signatures for X-28 Trust Runtime.
 * No actual verification happens in X-27.
 */
export interface IntegrityMetadata {
  readonly checksumRef?: string;
  readonly signatureRef?: string;
}

/**
 * DownloadedPlugin
 * 
 * The final cached artifact. It encapsulates the binary and its integrity references,
 * completely decoupled from how or where it was downloaded.
 */
export interface DownloadedPlugin {
  readonly pluginId: PluginId;
  readonly version: PluginVersion;
  readonly archive: PluginArchive;
  readonly integrity: IntegrityMetadata;
  readonly downloadedAt: string;
}
