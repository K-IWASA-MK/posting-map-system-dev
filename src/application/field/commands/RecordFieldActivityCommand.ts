export class RecordFieldActivityCommand {
  constructor(
    public readonly action: string,
    public readonly isDone: boolean,
    public readonly count: number,
    public readonly photoData: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly accuracy: number,
    public readonly staffId: string,
    public readonly staffName: string,
    public readonly areaName: string,
    public readonly rowId: number,
    public readonly tenantId?: string,
    public readonly branchId?: string
  ) {
    if (!action || action.trim().length === 0) {
      throw new Error("action is required");
    }
    if (count < 0) {
      throw new Error("count must be non-negative");
    }
    if (!staffId || staffId.trim().length === 0) {
      throw new Error("staffId is required");
    }
    if (!areaName || areaName.trim().length === 0) {
      throw new Error("areaName is required");
    }
    if (rowId <= 0) {
      throw new Error("rowId must be a positive integer");
    }
  }
}
