import { ProjectBootstrapManifest } from '../ProjectBootstrapManifest';

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ITemplateProvider {
  generateTemplates(manifest: ProjectBootstrapManifest): Promise<GeneratedFile[]>;
}
