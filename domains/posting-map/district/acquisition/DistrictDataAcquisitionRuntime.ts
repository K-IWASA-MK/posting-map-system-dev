import {
  DistrictDataAcquisitionRequest,
  RawDistrictData,
  DataAcquisitionEvent,
  DataAcquisitionEventType
} from "./contracts/DistrictDataAcquisitionContract";
import { DistrictDataAcquisitionService } from "./DistrictDataAcquisitionService";
import { DistrictDataRepository } from "./DistrictDataRepository";

export class DistrictDataAcquisitionRuntime {
  private readonly repository = new DistrictDataRepository();
  private readonly subscribers = new Set<(event: DataAcquisitionEvent) => void>();

  constructor(private readonly service: DistrictDataAcquisitionService) {}

  /**
   * Subscribes a listener to acquisition runtime events.
   */
  public subscribe(sub: (event: DataAcquisitionEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(type: DataAcquisitionEventType, requestId: string, districtName: string, error?: string): void {
    const event: DataAcquisitionEvent = {
      type,
      requestId,
      districtName,
      timestamp: Date.now(),
      error
    };
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[DistrictDataAcquisitionRuntime] Subscriber error:", err);
      }
    }
  }

  /**
   * Executes the district data acquisition flow:
   * 1. Resolves and compiles raw district data via service.
   * 2. Saves the compiled raw data atomically using repository.
   * 3. Emits lifecycle event DISTRICT_DATA_ACQUIRED or DISTRICT_DATA_ACQUISITION_FAILED.
   */
  public async executeAcquisition(
    request: DistrictDataAcquisitionRequest,
    options: { baseDir: string }
  ): Promise<RawDistrictData> {
    try {
      const data = await this.service.acquire(request);

      // Save raw data to target file: baseDir/<districtName>/raw-district.json
      this.repository.saveRawDistrict(data, options.baseDir);

      this.emit("DISTRICT_DATA_ACQUIRED", request.requestId, request.districtName);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emit("DISTRICT_DATA_ACQUISITION_FAILED", request.requestId, request.districtName, errorMsg);
      throw err;
    }
  }
}
