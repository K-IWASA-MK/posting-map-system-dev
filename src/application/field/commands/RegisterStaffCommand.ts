export class RegisterStaffCommand {
  constructor(
    public readonly staffNo: string,
    public readonly displayName: string,
    public readonly lineUserId: string,
    public readonly workspaceId: string
  ) {
    if (!staffNo || staffNo.trim().length === 0) {
      throw new Error("staffNo is required");
    }
    if (!displayName || displayName.trim().length === 0) {
      throw new Error("displayName is required");
    }
    if (!lineUserId || lineUserId.trim().length === 0) {
      throw new Error("lineUserId is required");
    }
    if (!workspaceId || workspaceId.trim().length === 0) {
      throw new Error("workspaceId is required");
    }
  }
}
