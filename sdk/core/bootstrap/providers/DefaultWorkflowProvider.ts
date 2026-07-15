import { IWorkflowProvider } from './IWorkflowProvider';
import { ProjectBootstrapManifest } from '../ProjectBootstrapManifest';
import { GeneratedFile } from './ITemplateProvider';

export class DefaultWorkflowProvider implements IWorkflowProvider {
  public async generateWorkflows(manifest: ProjectBootstrapManifest): Promise<GeneratedFile[]> {
    return [
      {
        path: '.github/workflows/ci.yml',
        content: `name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3`
      },
      {
        path: '.github/workflows/release.yml',
        content: `name: Release\non:\n  push:\n    tags:\n      - 'v*'\njobs:\n  release:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3`
      }
    ];
  }
}
