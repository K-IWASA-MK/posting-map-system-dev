import { ProjectBootstrapManifest } from '../ProjectBootstrapManifest';
import { GeneratedFile } from './ITemplateProvider';

export interface IWorkflowProvider {
  generateWorkflows(manifest: ProjectBootstrapManifest): Promise<GeneratedFile[]>;
}
