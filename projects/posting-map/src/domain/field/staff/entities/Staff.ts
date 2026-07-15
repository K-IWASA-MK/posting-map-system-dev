export class Staff {
  public readonly staffNo: string;
  public readonly displayName: string;
  public readonly lineUserId: string;
  public readonly workspaceId: string;
  public readonly createdAt: Date;

  constructor(params: {
    staffNo: string;
    displayName: string;
    lineUserId: string;
    workspaceId: string;
    createdAt?: Date;
  }) {
    if (!params.staffNo || params.staffNo.trim().length === 0) {
      throw new Error("staffNo is required");
    }
    if (!params.displayName || params.displayName.trim().length === 0) {
      throw new Error("displayName is required");
    }
    if (!params.lineUserId || params.lineUserId.trim().length === 0) {
      throw new Error("lineUserId is required");
    }
    if (!params.workspaceId || params.workspaceId.trim().length === 0) {
      throw new Error("workspaceId is required");
    }
    this.staffNo = params.staffNo;
    this.displayName = params.displayName;
    this.lineUserId = params.lineUserId;
    this.workspaceId = params.workspaceId;
    this.createdAt = params.createdAt || new Date();
  }
}
