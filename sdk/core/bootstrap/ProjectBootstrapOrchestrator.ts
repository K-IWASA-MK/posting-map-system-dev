import { ProjectBootstrapManifest } from './ProjectBootstrapManifest';
import { BootstrapContext } from './BootstrapContext';
import { BootstrapPlan } from './BootstrapPlan';
import { BootstrapStep } from './BootstrapStep';
import { BootstrapStateMachine } from './BootstrapStateMachine';
import { ITemplateProvider } from './providers/ITemplateProvider';
import { IWorkflowProvider } from './providers/IWorkflowProvider';
import { InitialGitService } from './providers/InitialGitService';
import { RepositoryProvisioningService } from '../repository/RepositoryProvisioningService';
import { ExecutionRecorder } from '../ledger/ExecutionRecorder';
import { ExecutionLedgerEntryType } from '../ledger/ExecutionLedgerEntryType';
import * as fs from 'fs';
import * as path from 'path';

export class ProjectBootstrapOrchestrator {
  private stateMachine = new BootstrapStateMachine();

  constructor(
    private provisioningService: RepositoryProvisioningService,
    private templateProvider: ITemplateProvider,
    private workflowProvider: IWorkflowProvider,
    private gitService: InitialGitService,
    private recorder: ExecutionRecorder
  ) {}

  public async bootstrap(manifest: ProjectBootstrapManifest, context: BootstrapContext): Promise<BootstrapPlan | void> {
    if (manifest.dryRun) {
      return this.generatePlan(manifest);
    }

    try {
      await this.recorder.record(
        ExecutionLedgerEntryType.BOOTSTRAP_STARTED,
        { context: context.workspaceId, manifest }
      );

      while (context.currentStep !== BootstrapStep.COMPLETE && context.currentStep !== BootstrapStep.FAILED) {
        await this.recorder.record(
          ExecutionLedgerEntryType.BOOTSTRAP_STEP_STARTED,
          { context: context.workspaceId, step: context.currentStep }
        );

        await this.executeStep(manifest, context);

        if ((context.currentStep as any) !== BootstrapStep.FAILED) {
          await this.recorder.record(
            ExecutionLedgerEntryType.BOOTSTRAP_STEP_COMPLETED,
            { context: context.workspaceId, step: context.currentStep }
          );
          this.stateMachine.advance(context);
        }
      }

      if (context.currentStep === BootstrapStep.COMPLETE) {
        await this.recorder.record(
          ExecutionLedgerEntryType.BOOTSTRAP_COMPLETED,
          { context: context.workspaceId, projectId: context.projectId }
        );
      }
    } catch (e: any) {
      this.stateMachine.fail(context, e);
      await this.recorder.record(
        ExecutionLedgerEntryType.BOOTSTRAP_FAILED,
        { context: context.workspaceId, error: e.message, step: context.currentStep }
      );
      throw e;
    }
  }

  private async executeStep(manifest: ProjectBootstrapManifest, context: BootstrapContext): Promise<void> {
    const targetDir = `/Volumes/SSD_DATA/${manifest.projectName}`; // Simplified path resolution
    
    switch (context.currentStep) {
      case BootstrapStep.VALIDATE:
        // Validation logic
        break;
      case BootstrapStep.CREATE_REPOSITORY:
        if (manifest.createRepository) {
          await this.provisioningService.provision({
            id: manifest.projectName,
            manifest: {
              repositoryName: manifest.projectName,
              repositoryType: manifest.repositoryType as any,
              owner: manifest.owner,
              visibility: manifest.visibility as 'public' | 'private'
            },
            state: 'NEW' as any,
            health: {} as any,
            metrics: {} as any,
            history: { lastEventId: '' }
          });
        }
        break;
      case BootstrapStep.GENERATE_TEMPLATE:
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const templates = await this.templateProvider.generateTemplates(manifest);
        const workflows = manifest.createActions ? await this.workflowProvider.generateWorkflows(manifest) : [];
        for (const file of [...templates, ...workflows]) {
          const filePath = path.join(targetDir, file.path);
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(filePath, file.content);
        }
        break;
      case BootstrapStep.INITIALIZE_GIT:
        if (manifest.initializeGit) {
          await this.gitService.initializeAndCommit(targetDir, manifest.defaultBranch);
        }
        break;
      case BootstrapStep.INITIAL_COMMIT:
        // Included in initializeGit for now
        break;
      case BootstrapStep.PUSH:
        if (manifest.pushInitialCommit) {
          await this.gitService.push(targetDir);
        }
        break;
      case BootstrapStep.CREATE_TAG:
        if (manifest.createInitialTag) {
          await this.gitService.tag(targetDir, 'v0.1.0');
        }
        break;
      case BootstrapStep.CREATE_RELEASE:
        if (manifest.createInitialRelease) {
          // Release creation is now handled separately by ReleaseRuntime.
          // The orchestrator just logs or skips this phase if separation is strict.
          // Or we can invoke ReleaseRuntime here if orchestrator controls the full flow.
          console.log('[ProjectBootstrapOrchestrator] CREATE_RELEASE skipped (delegated to ReleaseRuntime)');
        }
        break;
    }
  }

  private generatePlan(manifest: ProjectBootstrapManifest): BootstrapPlan {
    return {
      repository: manifest.createRepository ? [`Create ${manifest.visibility} repository ${manifest.owner}/${manifest.projectName}`] : [],
      files: ['README.md', 'LICENSE', 'CHANGELOG.md', '.github/workflows/ci.yml', '.github/workflows/release.yml'],
      git: manifest.initializeGit ? ['git init', 'git add .', 'git commit'] : [],
      github: manifest.createRepository ? ['Create remote on GitHub'] : [],
      release: manifest.createInitialRelease ? ['Create GitHub Release v0.1.0'] : [],
      actions: manifest.createActions ? ['Add ci.yml', 'Add release.yml'] : [],
      ledger: ['BOOTSTRAP_STARTED', '...STEPS...', 'BOOTSTRAP_COMPLETED']
    };
  }
}
