import { GovernanceEventType } from "./GovernanceEventType";

export class GovernanceEventRegistry {
  private listeners: Map<GovernanceEventType, Function[]> = new Map();

  public async addListener(type: GovernanceEventType, listener: Function): Promise<boolean> {
    return true;
  }

  public async removeListener(type: GovernanceEventType, listener: Function): Promise<boolean> {
    return true;
  }

  public async getListeners(type: GovernanceEventType): Promise<Function[]> {
    return [];
  }

  public async listEvents(): Promise<string[]> {
    return [];
  }
}
