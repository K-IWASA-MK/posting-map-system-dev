import * as fs from "fs";
import * as crypto from "crypto";
import { ImportAddressEntry, PostingAreaImportService } from "../import/PostingAreaImportService";
import { PostingAreaStorage } from "../storage/PostingAreaStorage";
import { PostingAreaValidator } from "../validation/PostingAreaValidator";
import { AreaMaster } from "../models/AreaMaster";
import { AreaMasterEvent, AreaMasterSchema } from "../contracts/AreaMasterContract";
import { ElectionMasterSchema } from "../../../election/master/contracts/ElectionMasterContract";
import { DistributionStatus, PostingAreaSchema } from "../contracts/PostingAreaContract";

export class PostingAreaRuntime {
  private readonly importService: PostingAreaImportService;
  private readonly storage: PostingAreaStorage;
  private readonly validator: PostingAreaValidator;
  private readonly subscribers = new Set<(event: AreaMasterEvent) => void>();

  constructor() {
    this.importService = new PostingAreaImportService();
    this.storage = new PostingAreaStorage();
    this.validator = new PostingAreaValidator();
  }

  public subscribe(sub: (event: AreaMasterEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(event: AreaMasterEvent): void {
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[AreaRuntime] Subscriber error:", err);
      }
    }
  }

  /**
   * Imports raw addresses, builds Areas, validates them, writes to file atomically,
   * and fires the POSTING_AREA_CREATED event.
   */
  public async importAreas(
    masterId: string,
    districtId: string,
    electionId: string,
    addressEntries: readonly ImportAddressEntry[],
    destinationPath: string,
    electionMaster?: ElectionMasterSchema
  ): Promise<{ status: "SUCCESS" | "FAILED"; master?: AreaMaster; error?: string }> {
    try {
      if (!addressEntries || addressEntries.length === 0) {
        throw new Error("Address entries list is empty or null.");
      }

      // Generate sourceHash of raw address input
      const sourceString = JSON.stringify(addressEntries);
      const sourceHash = crypto
        .createHash("sha256")
        .update(sourceString)
        .digest("hex");

      // Sort and chunk raw addresses to generate PostingArea list
      const generatedAreas = this.importService.importAddresses(addressEntries);

      // Write atomically to get contentHash
      const contentHash = this.storage.write(destinationPath, generatedAreas);

      // Instantiate AreaMaster (deep freezed)
      const generatedAt = new Date().toISOString();
      const master = new AreaMaster({
        masterId,
        districtId,
        electionId,
        generatedAt,
        areas: generatedAreas,
        sourceHash,
        contentHash
      });

      // Validate Master
      const valRes = this.validator.validateMaster(master, electionMaster);
      if (!valRes.success) {
        // Rollback created file on validation failure
        if (fs.existsSync(destinationPath)) {
          fs.unlinkSync(destinationPath);
        }
        const errorMsg = `Area Master validation failed: ${valRes.errors.join("; ")}`;
        this.emit({
          type: "POSTING_AREA_FAILED",
          masterId,
          districtId,
          areaCount: generatedAreas.length,
          hash: contentHash,
          timestamp: Date.now(),
          error: errorMsg
        });
        return { status: "FAILED", error: errorMsg };
      }

      this.emit({
        type: "POSTING_AREA_CREATED",
        masterId,
        districtId,
        areaCount: master.areas.length,
        hash: contentHash,
        timestamp: Date.now()
      });

      return {
        status: "SUCCESS",
        master
      };
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emit({
        type: "POSTING_AREA_FAILED",
        masterId,
        districtId,
        areaCount: 0,
        hash: "",
        timestamp: Date.now(),
        error: errorMsg
      });
      return { status: "FAILED", error: errorMsg };
    }
  }

  /**
   * Updates distribution status or assignee of an area, runs transition and schema checks,
   * writes updated state atomically, and emits the POSTING_AREA_UPDATED event.
   */
  public async updateAreaStatus(
    masterId: string,
    areaId: string,
    newStatus: DistributionStatus,
    assignee: string | undefined,
    destinationPath: string,
    electionMaster?: ElectionMasterSchema
  ): Promise<{ status: "SUCCESS" | "FAILED"; master?: AreaMaster; error?: string }> {
    try {
      // 1. Read existing areas
      const existingAreas = this.storage.read(destinationPath);
      const targetIndex = existingAreas.findIndex(a => a.areaId === areaId);

      if (targetIndex === -1) {
        throw new Error(`Area not found with ID: '${areaId}'`);
      }

      const targetArea = existingAreas[targetIndex];

      // 2. Validate state transition rules
      const transitionVal = this.validator.validateTransition(targetArea.distributionStatus, newStatus);
      if (!transitionVal.success) {
        throw new Error(transitionVal.error);
      }

      // Check operational constraint: ASSIGNED status must have assignee
      if (newStatus === "ASSIGNED" && (!assignee || assignee.trim() === "")) {
        throw new Error("Assignee is required when status is ASSIGNED.");
      }

      // 3. Create updated area schema
      const updatedArea: PostingAreaSchema = {
        ...targetArea,
        distributionStatus: newStatus,
        assignee: newStatus === "UNASSIGNED" ? undefined : (assignee || targetArea.assignee)
      };

      existingAreas[targetIndex] = updatedArea;

      // 4. Atomic write updated areas
      const contentHash = this.storage.write(destinationPath, existingAreas);

      // Re-generate master model
      const generatedAt = new Date().toISOString();
      const master = new AreaMaster({
        masterId,
        districtId: "mie-03", // Default mock district for Mie 3rd district
        electionId: "house-2026",
        generatedAt,
        areas: existingAreas,
        sourceHash: "UPDATED", // sourceHash is marked as updated
        contentHash
      });

      // 5. Validate updated master
      const valRes = this.validator.validateMaster(master, electionMaster);
      if (!valRes.success) {
        const errorMsg = `Updated Area Master validation failed: ${valRes.errors.join("; ")}`;
        this.emit({
          type: "POSTING_AREA_FAILED",
          masterId,
          districtId: master.districtId,
          areaCount: existingAreas.length,
          hash: contentHash,
          timestamp: Date.now(),
          error: errorMsg
        });
        return { status: "FAILED", error: errorMsg };
      }

      this.emit({
        type: "POSTING_AREA_UPDATED",
        masterId,
        districtId: master.districtId,
        areaCount: master.areas.length,
        hash: contentHash,
        timestamp: Date.now()
      });

      return {
        status: "SUCCESS",
        master
      };
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emit({
        type: "POSTING_AREA_FAILED",
        masterId,
        districtId: "unknown",
        areaCount: 0,
        hash: "",
        timestamp: Date.now(),
        error: errorMsg
      });
      return { status: "FAILED", error: errorMsg };
    }
  }
}
