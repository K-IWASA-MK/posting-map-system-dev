import { ProvisioningStage } from './ProvisioningStage';
import { AssetCloner } from './AssetCloner';

export interface ProvisioningContext {
  missionId: string;
  districtName: string;
  spreadsheetId?: string;
  storageFolderId?: string;
  districtFolderId?: string;
  error?: string;
  token?: string;
  isMock: boolean;
}

export class ProvisioningStateMachine {
  private currentStage: ProvisioningStage = ProvisioningStage.REQUESTED;
  private history: { stage: ProvisioningStage; timestamp: string }[] = [];

  constructor(private context: ProvisioningContext) {
    this.transitionTo(ProvisioningStage.REQUESTED);
  }

  public getStage(): ProvisioningStage {
    return this.currentStage;
  }

  public getHistory() {
    return this.history;
  }

  public transitionTo(newStage: ProvisioningStage) {
    this.currentStage = newStage;
    this.history.push({
      stage: newStage,
      timestamp: new Date().toISOString()
    });
    console.log(`[Provisioning SM] Transitioned to state: ${newStage} (Mission: ${this.context.missionId})`);
  }

  public async fail(errorMessage: string) {
    this.context.error = errorMessage;
    this.transitionTo(ProvisioningStage.FAILED);
    console.error(`[Provisioning SM] Provisioning failed: ${errorMessage}. Initiating rollback...`);
    await this.rollback();
  }

  private async rollback() {
    const token = this.context.token || '';
    const isMock = this.context.isMock;

    try {
      // 1. Delete cloned spreadsheet if created
      if (this.context.spreadsheetId) {
        console.log(`[Rollback] Deleting cloned spreadsheet: ${this.context.spreadsheetId}`);
        await AssetCloner.deleteFileOrFolder(this.context.spreadsheetId, token, isMock);
      }

      // 2. Delete cloned storage folder if created
      if (this.context.storageFolderId) {
        console.log(`[Rollback] Deleting created storage folder: ${this.context.storageFolderId}`);
        await AssetCloner.deleteFileOrFolder(this.context.storageFolderId, token, isMock);
      }

      // 3. Delete district folder if newly created
      if (this.context.districtFolderId) {
        console.log(`[Rollback] Deleting district root folder: ${this.context.districtFolderId}`);
        await AssetCloner.deleteFileOrFolder(this.context.districtFolderId, token, isMock);
      }

      console.log(`[Rollback] Rollback completed successfully.`);
    } catch (err: any) {
      console.error(`[Rollback Critical Error] Failed to complete rollback cleanups: ${err.message}`);
    }
  }
}
