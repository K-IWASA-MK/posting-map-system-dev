/**
 * ProjectMetadata.ts
 * 
 * Metadata interface for Client Projects
 */

export interface ProjectMetadata {
  version: string;
  environment: 'development' | 'staging' | 'production';
  callbackUrl?: string;
  customSettings?: Record<string, any>;
}
