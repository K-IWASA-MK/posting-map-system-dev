import { RemotePackageRuntime } from '../RemotePackageRuntime';
import { DefaultDownloader } from '../DefaultDownloader';
import { DefaultPackageCache } from '../PackageCache';
import { ITransport } from '../interfaces';
import { RemotePackage, DownloadSession } from '../models';
import { RetryPolicy } from '../RetryPolicy';
import { MirrorSelector } from '../MirrorSelector';

class MockTransport implements ITransport {
  public protocol = 'mock';
  public callCount = 0;
  
  constructor(
    private readonly shouldFail: boolean = false,
    private readonly failTimes: number = 0,
    private readonly data: Uint8Array = new Uint8Array([1, 2, 3])
  ) {}

  async fetch(uri: string, offset: number = 0): Promise<Uint8Array> {
    this.callCount++;
    if (this.shouldFail || this.callCount <= this.failTimes) {
      throw new Error(`Transport error on ${uri}`);
    }
    return this.data.slice(offset);
  }
}

describe('Remote Package Runtime (Sprint X-27)', () => {
  const mockPackage: RemotePackage = {
    pluginId: 'com.example.remote',
    version: '1.0.0',
    mirrors: ['mock://primary.example.com', 'mock://secondary.example.com'],
    checksumRef: 'sha256:abcd',
    signatureRef: 'sig:1234'
  };

  it('Download-001: Download Success', async () => {
    const transport = new MockTransport();
    const downloader = new DefaultDownloader(transport);
    const session = await downloader.startDownload({ package: mockPackage });
    const archive = await downloader.finalize(session);
    
    expect(archive.size).toBe(3);
    expect(transport.callCount).toBe(1);
  });

  it('Download-002: Hard Failure', async () => {
    const transport = new MockTransport(true);
    // Setup retry policy with 1 retry to fail fast
    const downloader = new DefaultDownloader(transport, new MirrorSelector(), new RetryPolicy(1, 10));
    
    await expect(downloader.startDownload({ package: mockPackage })).rejects.toThrow('All mirrors exhausted. Download failed.');
  });

  it('Cache-001: Cache Hit', async () => {
    const transport = new MockTransport();
    const cache = new DefaultPackageCache();
    const downloader = new DefaultDownloader(transport);
    const runtime = new RemotePackageRuntime(cache, downloader);

    // Initial fetch (Cache Miss)
    await runtime.getPackage(mockPackage);
    expect(transport.callCount).toBe(1);

    // Second fetch (Cache Hit)
    const result = await runtime.getPackage(mockPackage);
    expect(transport.callCount).toBe(1); // Call count should not increase
    expect(result.pluginId).toBe(mockPackage.pluginId);
  });

  it('Cache-002: Cache Miss', async () => {
    const transport = new MockTransport();
    const cache = new DefaultPackageCache();
    const downloader = new DefaultDownloader(transport);
    const runtime = new RemotePackageRuntime(cache, downloader);

    // Cache is empty, should trigger download
    const result = await runtime.getPackage(mockPackage);
    expect(transport.callCount).toBe(1);
    expect(result.archive.size).toBe(3);
  });

  it('Retry-001: Retry Policy', async () => {
    // Fails twice, succeeds on third try
    const transport = new MockTransport(false, 2);
    // Allow up to 3 retries, minimal delay
    const downloader = new DefaultDownloader(transport, new MirrorSelector(), new RetryPolicy(3, 10));
    const session = await downloader.startDownload({ package: mockPackage });
    
    expect(session.isComplete).toBe(true);
    expect(transport.callCount).toBe(3);
  });

  it('Resume-001: DownloadSession Resume', async () => {
    const transport = new MockTransport();
    const downloader = new DefaultDownloader(transport);
    
    // Simulate an interrupted session
    const interruptedSession: DownloadSession = {
      sessionId: 'test-session',
      request: { package: mockPackage },
      downloadedBytes: 1, // Already downloaded 1 byte
      isComplete: false
    };

    const resumedSession = await downloader.resumeDownload(interruptedSession);
    const archive = await downloader.finalize(resumedSession);
    
    expect(resumedSession.isComplete).toBe(true);
    expect(archive.size).toBe(2); // Since offset was 1, fetched remaining 2 bytes
  });

  it('Mirror-001: MirrorSelector', async () => {
    class FailingPrimaryTransport implements ITransport {
      public protocol = 'mock';
      public usedMirrors: string[] = [];

      async fetch(uri: string): Promise<Uint8Array> {
        this.usedMirrors.push(uri);
        if (uri.includes('primary')) {
          throw new Error('Primary is down');
        }
        return new Uint8Array([4, 5, 6]);
      }
    }

    const transport = new FailingPrimaryTransport();
    // Fast fail for retries
    const downloader = new DefaultDownloader(transport, new MirrorSelector(), new RetryPolicy(1, 10));
    
    const session = await downloader.startDownload({ package: mockPackage });
    expect(session.isComplete).toBe(true);
    // Tried primary, then secondary
    expect(transport.usedMirrors).toEqual(['mock://primary.example.com', 'mock://secondary.example.com']);
  });

  it('Integrity-001: checksumRef / signatureRef 取得のみ', async () => {
    const transport = new MockTransport();
    const cache = new DefaultPackageCache();
    const downloader = new DefaultDownloader(transport);
    const runtime = new RemotePackageRuntime(cache, downloader);

    const result = await runtime.getPackage(mockPackage);
    
    expect(result.integrity.checksumRef).toBe('sha256:abcd');
    expect(result.integrity.signatureRef).toBe('sig:1234');
    // We only attach metadata, no verification throws
  });

  it('Isolation-001: HTTP を Loader が知らない', async () => {
    const transport = new MockTransport();
    const cache = new DefaultPackageCache();
    const downloader = new DefaultDownloader(transport);
    const runtime = new RemotePackageRuntime(cache, downloader);

    const result = await runtime.getPackage(mockPackage);
    
    // The result does not contain any trace of 'mock://' or transport headers
    expect((result as any).url).toBeUndefined();
    expect((result as any).headers).toBeUndefined();
    expect(result.archive).toBeDefined();
    // Proven isolated by the strong typing of DownloadedPlugin which lacks transport fields
  });
});
