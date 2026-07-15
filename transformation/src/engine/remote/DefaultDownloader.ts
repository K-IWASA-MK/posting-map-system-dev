import { IPackageDownloader, ITransport } from './interfaces';
import { DownloadRequest, DownloadSession, PluginArchive } from './models';
import { MirrorSelector } from './MirrorSelector';
import { RetryPolicy } from './RetryPolicy';

export class DefaultDownloader implements IPackageDownloader {
  constructor(
    private readonly transport: ITransport,
    private readonly mirrorSelector: MirrorSelector = new MirrorSelector(),
    private readonly retryPolicy: RetryPolicy = new RetryPolicy()
  ) {}

  async startDownload(request: DownloadRequest): Promise<DownloadSession> {
    // Generate simple pseudo-random ID for browser/node compatibility without crypto module
    const sessionId = Math.random().toString(36).substring(2, 15);
    const session: DownloadSession = {
      sessionId,
      request,
      downloadedBytes: 0,
      isComplete: false,
    };
    return this.resumeDownload(session);
  }

  async resumeDownload(session: DownloadSession): Promise<DownloadSession> {
    const failedMirrors = new Set<string>();

    while (!session.isComplete) {
      let currentMirror: string;
      try {
        currentMirror = this.mirrorSelector.select(session.request.package.mirrors, failedMirrors);
      } catch (err) {
        throw new Error('All mirrors exhausted. Download failed.');
      }

      try {
        // Use RetryPolicy around the transport fetch
        const data = await this.retryPolicy.execute(async () => {
          return this.transport.fetch(currentMirror, session.downloadedBytes);
        });

        return {
          ...session,
          downloadedBytes: session.downloadedBytes + data.length,
          archiveData: data, // Note: In a real system we append. Here we overwrite for simulation.
          isComplete: true
        };
      } catch (error) {
        // Mirror failed completely (retries exhausted)
        failedMirrors.add(currentMirror);
      }
    }
    
    return session;
  }

  async finalize(session: DownloadSession): Promise<PluginArchive> {
    if (!session.isComplete || !session.archiveData) {
      throw new Error('Cannot finalize incomplete session');
    }
    return {
      data: session.archiveData,
      size: session.archiveData.length
    };
  }
}
