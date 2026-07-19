import { DistrictMasterSchema, DistrictMasterEvent, DistrictMasterEventType } from "../contracts/DistrictMasterContract";
import { DistrictMasterRepository } from "../storage/DistrictMasterRepository";
import { DistrictMasterValidator } from "../validation/DistrictMasterValidator";
import { DistrictMaster } from "../models/DistrictMaster";

export class DistrictMasterRuntime {
  private readonly repository = new DistrictMasterRepository();
  private readonly validator = new DistrictMasterValidator();
  private readonly subscribers = new Set<(event: DistrictMasterEvent) => void>();

  constructor(private readonly registryFilePath: string) {}

  /**
   * Subscribes a listener to district master events.
   */
  public subscribe(sub: (event: DistrictMasterEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(type: DistrictMasterEventType, districtId: string, districtName: string, error?: string): void {
    const event: DistrictMasterEvent = {
      type,
      districtId,
      districtName,
      timestamp: Date.now(),
      error
    };
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[DistrictMasterRuntime] Subscriber error:", err);
      }
    }
  }

  /**
   * Registers a new DistrictMaster.
   * Performs schema validations, uniqueness checks, atomic storage, and emits events.
   */
  public async registerDistrict(
    input: Omit<DistrictMasterSchema, "createdAt" | "updatedAt" | "sourceHash" | "contentHash">
  ): Promise<{ status: "SUCCESS" | "FAILED"; master?: DistrictMaster; error?: string }> {
    try {
      const list = [...this.repository.read(this.registryFilePath)];

      const sourceHash = this.validator.calculateSourceHash(input.municipalities);
      
      const nowStr = new Date().toISOString();
      const mockSchema: DistrictMasterSchema = {
        ...input,
        createdAt: nowStr,
        updatedAt: nowStr,
        sourceHash,
        contentHash: "PRE_WRITE"
      };

      // 1. Schema check
      const schemaVal = this.validator.validate(mockSchema);
      if (!schemaVal.success) {
        throw new Error(schemaVal.errors.join("; "));
      }

      // 2. Uniqueness check
      const pendingList = [...list, mockSchema];
      const registryVal = this.validator.validateRegistry(pendingList);
      if (!registryVal.success) {
        throw new Error(registryVal.errors.join("; "));
      }

      // 3. Write atomically to calculate contentHash
      const contentHash = this.repository.write(this.registryFilePath, pendingList);

      // Create model (deep frozen)
      const master = new DistrictMaster({
        ...mockSchema,
        contentHash
      });

      this.emit("DISTRICT_MASTER_CREATED", master.districtId, master.districtName);

      return {
        status: "SUCCESS",
        master
      };
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emit("DISTRICT_MASTER_FAILED", input.districtId || "unknown", input.districtName || "unknown", errorMsg);
      return {
        status: "FAILED",
        error: errorMsg
      };
    }
  }

  /**
   * Reads all registered district masters.
   */
  public getDistricts(): readonly DistrictMasterSchema[] {
    return this.repository.read(this.registryFilePath);
  }
}
