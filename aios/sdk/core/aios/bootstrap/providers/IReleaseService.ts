export interface IReleaseService {
  createRelease(tag: string, notes: string): Promise<void>;
}

export class MockReleaseService implements IReleaseService {
  public async createRelease(tag: string, notes: string): Promise<void> {
    console.log(`[MockReleaseService] Release created: ${tag}`);
  }
}
