export interface ReleaseManifest {
  releaseId: string;
  repositoryId: string;
  version: string;
  releaseType: 'major' | 'minor' | 'patch';
  draft: boolean;
  prerelease: boolean;
  assets: string[];
  notes?: string;
  createdBy: string;
  contractVersion: string;
}
