import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { SchemaValidator } from "./validation/SchemaValidator";
import { SourceHashGenerator } from "./utils/SourceHashGenerator";
import { OutputHashGenerator } from "./utils/OutputHashGenerator";
import { DashboardAuditPublisher } from "./audit/DashboardAuditPublisher";
import { DashboardDataAuditEvent } from "./audit/DashboardDataAuditEvent";
import { ElectionResearchAdapter } from "./adapters/ElectionResearchAdapter";
import { DeploymentAdapter } from "./adapters/DeploymentAdapter";
import { ActivationAdapter } from "./adapters/ActivationAdapter";
import { AssetRegistryAdapter } from "./adapters/AssetRegistryAdapter";
import { DashboardDataBuilder } from "./builder/DashboardDataBuilder";
import { DashboardDataCompletedEvent, DashboardDataEvent } from "./contract/DashboardDataContract";
import { PostingMapPathResolver } from "../../shared/PostingMapPathResolver";

export class DashboardDataRuntime {
  private localWorkspaceRoot: string;

  constructor(localWorkspaceRoot: string) {
    this.localWorkspaceRoot = localWorkspaceRoot;
  }

  /**
   * Processes the read model transformation event.
   * Loads inputs, validates schemas, generates deterministic hashes, builds dashboard contract, and writes output.
   */
  public async processEvent(event: DashboardDataEvent): Promise<{ success: boolean; event?: DashboardDataCompletedEvent; error?: string }> {
    if (event.type !== "DASHBOARD_DATA_REQUESTED") {
      return { success: false, error: `Unsupported event type: ${event.type}` };
    }

    if (!event.districtName || event.districtName.trim() === "") {
      return { success: false, error: "Invalid or empty districtName provided." };
    }

    console.log(`[DashboardDataRuntime] Processing dashboard read model generation for: ${event.districtName} (Mission: ${event.missionId})`);

    try {
      const pathResolver = new PostingMapPathResolver(this.localWorkspaceRoot);
      const branchFolder = pathResolver.getBranchDirectory(event.districtName);

      const researchPath = path.join(branchFolder, "election-research-result.json");
      const deploymentPath = path.join(branchFolder, "deployment.json");
      const activationPath = path.join(branchFolder, "activation.json");
      const assetRegistryPath = pathResolver.getAssetRegistryPath();

      // 1. Existence Checks
      if (!fs.existsSync(researchPath)) throw new Error(`Missing required input: ${researchPath}`);
      if (!fs.existsSync(deploymentPath)) throw new Error(`Missing required input: ${deploymentPath}`);
      if (!fs.existsSync(activationPath)) throw new Error(`Missing required input: ${activationPath}`);
      if (!fs.existsSync(assetRegistryPath)) throw new Error(`Missing required input: ${assetRegistryPath}`);

      // Read contents
      const researchContent = fs.readFileSync(researchPath, "utf-8");
      const deploymentContent = fs.readFileSync(deploymentPath, "utf-8");
      const activationContent = fs.readFileSync(activationPath, "utf-8");
      const assetRegistryContent = fs.readFileSync(assetRegistryPath, "utf-8");

      const researchJson = JSON.parse(researchContent);
      const deploymentJson = JSON.parse(deploymentContent);
      const activationJson = JSON.parse(activationContent);
      const assetRegistryJson = JSON.parse(assetRegistryContent);

      // 2. Type & Required Fields Checks (Schema Validation)
      const resVal = SchemaValidator.validateElectionResearch(researchJson);
      if (!resVal.valid) throw new Error(`Invalid schema in election-research-result.json: ${resVal.errors.join(", ")}`);

      const depVal = SchemaValidator.validateDeployment(deploymentJson);
      if (!depVal.valid) throw new Error(`Invalid schema in deployment.json: ${depVal.errors.join(", ")}`);

      const actVal = SchemaValidator.validateActivation(activationJson);
      if (!actVal.valid) throw new Error(`Invalid schema in activation.json: ${actVal.errors.join(", ")}`);

      const registryVal = SchemaValidator.validateAssetRegistry(assetRegistryJson);
      if (!registryVal.valid) throw new Error(`Invalid schema in AssetRegistry.json: ${registryVal.errors.join(", ")}`);

      // 3. Source Hash Verification (Deterministic source hash generation)
      const sourceHash = SourceHashGenerator.generate({
        researchJson: researchContent,
        deploymentJson: deploymentContent,
        activationJson: activationContent,
        assetRegistryJson: assetRegistryContent
      });

      // 4. Adapt inputs into flat models
      const adaptedResearchDistrict = ElectionResearchAdapter.adaptDistrict(researchJson);
      const adaptedMunicipalities = ElectionResearchAdapter.adaptMunicipalities(researchJson);
      const adaptedTurnoutComparison = ElectionResearchAdapter.adaptTurnoutComparison(researchJson);

      const adaptedDeploymentDistrict = DeploymentAdapter.adaptDistrict(deploymentJson);
      const adaptedDeploymentBranch = DeploymentAdapter.adaptBranchStatus(deploymentJson);
      const adaptedDeploymentAsset = DeploymentAdapter.adaptAssetStatus(deploymentJson);

      const adaptedActivationDistrict = ActivationAdapter.adaptDistrict(activationJson);
      const adaptedActivationBranch = ActivationAdapter.adaptBranchStatus(activationJson);

      const districtId = adaptedActivationDistrict.id || adaptedDeploymentDistrict.id || adaptedResearchDistrict.id;
      const adaptedRegistryAsset = AssetRegistryAdapter.checkRegistration(assetRegistryJson, districtId);

      // Resolve fields
      const finalDistrict = {
        id: districtId,
        name: adaptedActivationDistrict.name || adaptedDeploymentDistrict.name || adaptedResearchDistrict.name,
        status: adaptedActivationDistrict.status || adaptedDeploymentDistrict.status || "UNKNOWN"
      };

      const finalBranchStatus = {
        districtId: finalDistrict.id,
        districtName: finalDistrict.name,
        provisioningStatus: adaptedDeploymentBranch.provisioningStatus || "UNKNOWN",
        activationStatus: adaptedActivationBranch.activationStatus || "INACTIVE",
        activatedAt: adaptedActivationBranch.activatedAt || 0,
        lineCheck: adaptedActivationBranch.lineCheck || "FAIL",
        gasCheck: adaptedActivationBranch.gasCheck || "FAIL"
      };

      const finalAssetStatus = {
        districtId: finalDistrict.id,
        spreadsheetId: adaptedDeploymentAsset.spreadsheetId || adaptedRegistryAsset.spreadsheetId,
        storageFolderId: adaptedDeploymentAsset.storageFolderId || adaptedRegistryAsset.storageFolderId,
        scriptId: adaptedDeploymentAsset.scriptId || adaptedRegistryAsset.gasScriptId,
        webAppUrl: adaptedDeploymentAsset.webAppUrl || "",
        inRegistry: adaptedRegistryAsset.inRegistry
      };

      // 5. Fixed execution ID and generatedAt format definition
      const timestamp = Date.now();
      const shortHash = sourceHash.substring(0, 8);
      const executionId = `dashboard-runtime-${timestamp}-${shortHash}`;
      const generatedAt = new Date().toISOString();

      const lineageSources = [
        "election-research-result.json",
        "deployment.json",
        "activation.json",
        "AssetRegistry.json"
      ];

      // 6. Build unified view model representation with a blank outputHash first
      const dashboardData = DashboardDataBuilder.build({
        district: finalDistrict,
        municipalities: adaptedMunicipalities,
        turnoutComparison: adaptedTurnoutComparison,
        branchStatus: finalBranchStatus,
        assetStatus: finalAssetStatus,
        sourceHash,
        executionId,
        generatedAt,
        lineageSources,
        outputHash: ""
      });

      // 7. Calculate outputHash canonically using OutputHashGenerator
      const outputHash = OutputHashGenerator.generate(dashboardData);
      dashboardData.lineage.outputHash = outputHash;

      // 8. Validate output Contract schema
      const outputVal = SchemaValidator.validateDashboardData(dashboardData);
      if (!outputVal.valid) throw new Error(`Generated dashboard-data contract validation failed: ${outputVal.errors.join(", ")}`);

      // 9. Write to output file
      const outputPath = path.join(branchFolder, "dashboard-data.json");
      fs.writeFileSync(outputPath, JSON.stringify(dashboardData, null, 2), "utf-8");
      console.log(`[DashboardDataRuntime] Successfully generated dashboard-data.json at ${outputPath}`);

      // 10. Publish Audit Event (Non-blocking: protected by try-catch)
      try {
        const auditEvent: DashboardDataAuditEvent = {
          eventType: "DASHBOARD_DATA_GENERATED",
          executionId,
          schemaVersion: "v1",
          runtime: {
            name: "DashboardDataRuntime",
            version: "1.0.0"
          },
          sourceHash,
          output: {
            file: `03_BRANCH/${event.districtName}/dashboard-data.json`,
            schemaVersion: "v1"
          },
          timestamp: generatedAt,
          lineage: {
            sources: lineageSources,
            sourceHash,
            outputHash
          }
        };
        DashboardAuditPublisher.publish(auditEvent);
      } catch (auditErr: any) {
        console.warn(`[DashboardDataRuntime] Non-blocking audit publication failure: ${auditErr.message}`);
      }

      // Calculate result file checksum (SHA-256 of finalized output file)
      const outputContent = JSON.stringify(dashboardData, null, 2);
      const fileChecksumHash = crypto.createHash("sha256");
      fileChecksumHash.update(outputContent);
      const checksum = fileChecksumHash.digest("hex");

      const completedEvent: DashboardDataCompletedEvent = {
        type: "DASHBOARD_DATA_COMPLETED",
        missionId: event.missionId,
        districtName: event.districtName,
        outputFile: `03_BRANCH/${event.districtName}/dashboard-data.json`,
        checksum
      };

      return { success: true, event: completedEvent };
    } catch (error: any) {
      console.error(`[DashboardDataRuntime] Execution failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
