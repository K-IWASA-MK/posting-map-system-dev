export class RegisterStaffCommand {
  constructor(
    public readonly staffNo: string | undefined,
    public readonly displayName: string,
    public readonly lineUserId: string,
    public readonly workspaceId: string
  ) {
    if (staffNo !== undefined && staffNo.trim().length === 0) {
      throw new Error("staffNo cannot be empty");
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
