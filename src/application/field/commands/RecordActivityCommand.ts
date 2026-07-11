export class RecordActivityCommand {
  constructor(
    public readonly staffNo: string,
    public readonly quantity: number,
    public readonly photoUrl: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly accuracy: number = 0
  ) {
    if (!staffNo || staffNo.trim().length === 0) {
      throw new Error("staffNo is required");
    }
    if (quantity <= 0) {
      throw new Error("quantity must be greater than 0");
    }
    if (!photoUrl || photoUrl.trim().length === 0) {
      throw new Error("photoUrl is required");
    }
  }
}
