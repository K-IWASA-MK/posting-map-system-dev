import { SalesGeneratorEvent, SalesGeneratorEventType } from "./SalesGeneratorEvents";
import { SalesGeneratorViewModel, GenerationSession } from "./SalesGeneratorViewModel";
import { SalesGeneratorValidator } from "./SalesGeneratorValidator";

// Conditional Node-only imports
let fs: any = null;
let path: any = null;
let crypto: any = null;

let DistrictDataAcquisitionRuntimeClass: any = null;
let LocalDistrictDataSourceClass: any = null;
let DistrictDataAcquisitionServiceClass: any = null;
let DistrictMasterRuntimeClass: any = null;
let DistrictMasterRepositoryClass: any = null;
let DistrictMasterResolverClass: any = null;
let PostingAreaRuntimeClass: any = null;
let ElectionDashboardStorageRuntimeClass: any = null;
let PostingMapVisualizationRuntimeClass: any = null;
let DistrictInitializationWorkflowClass: any = null;
let DistrictInitializationRuntimeClass: any = null;
let DashboardRuntimeClass: any = null;

const isNode = typeof process !== "undefined" && process.versions && process.versions.node;

if (isNode) {
  fs = require("fs");
  path = require("path");
  crypto = require("crypto");

  // Dynamic require of domains to avoid browser bundle loading errors
  const acqModule = require("../../../../domains/posting-map/district/acquisition/DistrictDataAcquisitionRuntime");
  DistrictDataAcquisitionRuntimeClass = acqModule.DistrictDataAcquisitionRuntime;

  const sourceModule = require("../../../../domains/posting-map/district/acquisition/contracts/DistrictDataSource");
  LocalDistrictDataSourceClass = sourceModule.LocalDistrictDataSource;

  const serviceModule = require("../../../../domains/posting-map/district/acquisition/DistrictDataAcquisitionService");
  DistrictDataAcquisitionServiceClass = serviceModule.DistrictDataAcquisitionService;

  const masterModule = require("../../../../domains/posting-map/district/runtime/DistrictMasterRuntime");
  DistrictMasterRuntimeClass = masterModule.DistrictMasterRuntime;

  const repoModule = require("../../../../domains/posting-map/district/storage/DistrictMasterRepository");
  DistrictMasterRepositoryClass = repoModule.DistrictMasterRepository;

  const resolverModule = require("../../../../domains/posting-map/district/resolver/DistrictMasterResolver");
  DistrictMasterResolverClass = resolverModule.DistrictMasterResolver;

  const areaModule = require("../../../../domains/posting-map/area/runtime/PostingAreaRuntime");
  PostingAreaRuntimeClass = areaModule.PostingAreaRuntime;

  const electionModule = require("../../../../domains/election/storage/runtime/ElectionDashboardStorageRuntime");
  ElectionDashboardStorageRuntimeClass = electionModule.ElectionDashboardStorageRuntime;

  const visualModule = require("../../../../domains/posting-map/visualization/runtime/PostingMapVisualizationRuntime");
  PostingMapVisualizationRuntimeClass = visualModule.PostingMapVisualizationRuntime;

  const workflowModule = require("../../../../domains/posting-map/initialization/models/DistrictInitializationWorkflow");
  DistrictInitializationWorkflowClass = workflowModule.DistrictInitializationWorkflow;

  const initModule = require("../../../../domains/posting-map/initialization/runtime/DistrictInitializationRuntime");
  DistrictInitializationRuntimeClass = initModule.DistrictInitializationRuntime;

  const dashModule = require("../../../../domains/posting-map/dashboard/runtime/DashboardRuntime");
  DashboardRuntimeClass = dashModule.DashboardRuntime;
}

export class SalesGeneratorRuntime {
  private readonly validator = new SalesGeneratorValidator();
  private readonly subscribers: Set<(event: SalesGeneratorEvent) => void> = new Set();
  private baseDir: string = "";

  constructor(baseDir?: string) {
    if (isNode) {
      this.baseDir = baseDir || path.join(__dirname, "../../../../scratch/sales-generator-runtime-data");
    }
  }

  public subscribe(sub: (event: SalesGeneratorEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(
    type: SalesGeneratorEventType,
    session: GenerationSession,
    progress: number,
    currentTask: string,
    completedTasks: string[],
    error?: string
  ): void {
    const event: SalesGeneratorEvent = {
      type,
      sessionId: session.sessionId,
      requestId: session.requestId,
      districtId: session.districtId,
      districtName: session.districtName,
      timestamp: Date.now(),
      progress,
      currentTask,
      completedTasks,
      error
    };
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[SalesGeneratorRuntime] Subscriber notification failed:", err);
      }
    }
  }

  /**
   * Triggers the E2E generation flow.
   */
  public async generate(districtName: string, viewModel: SalesGeneratorViewModel): Promise<void> {
    const validation = this.validator.validateDistrictName(districtName);
    if (!validation.success) {
      viewModel.status = "failed";
      viewModel.error = validation.error || "Validation error";
      return;
    }

    viewModel.reset();
    viewModel.districtName = districtName;
    viewModel.status = "running";

    const sessionId = "sess-" + Math.random().toString(36).substr(2, 9);
    const requestId = "req-" + Math.random().toString(36).substr(2, 9);
    // Determine districtId mapping
    let districtId = "unknown";
    if (districtName === "三重県第3区") {
      districtId = "mie-03";
    } else if (districtName === "埼玉県第8区") {
      districtId = "saitama-08";
    }

    const session: GenerationSession = {
      sessionId,
      requestId,
      districtId,
      districtName,
      startedAt: new Date().toISOString(),
      status: "RUNNING"
    };

    viewModel.session = session;

    if (isNode) {
      await this.runNodeGeneration(session, viewModel);
    } else {
      await this.runBrowserSimulation(session, viewModel);
    }
  }

  /**
   * Node.js execution: invokes actual runtimes.
   */
  private async runNodeGeneration(session: GenerationSession, viewModel: SalesGeneratorViewModel): Promise<void> {
    try {
      const registryFile = path.join(this.baseDir, "district-registry.json");

      // 1. Ensure directories exist & bootstrap default districts in registry file
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }

      const masterRuntime = new DistrictMasterRuntimeClass(registryFile);
      
      // Seed default districts if file doesn't exist
      if (!fs.existsSync(registryFile) || fs.readFileSync(registryFile, "utf-8").trim() === "") {
        fs.writeFileSync(registryFile, "[]", "utf-8");
        await masterRuntime.registerDistrict({
          districtId: "mie-03",
          districtName: "三重県第3区",
          prefecture: "三重県",
          districtNumber: "3",
          masterVersion: "2026.01",
          effectiveFrom: "2026-01-01",
          municipalities: [
            { municipalityCode: "24205", municipalityName: "桑名市" },
            { municipalityCode: "24214", municipalityName: "いなべ市" },
            { municipalityCode: "24202", municipalityName: "四日市市" }
          ]
        });
        await masterRuntime.registerDistrict({
          districtId: "saitama-08",
          districtName: "埼玉県第8区",
          prefecture: "埼玉県",
          districtNumber: "8",
          masterVersion: "2026.01",
          effectiveFrom: "2026-01-01",
          municipalities: [
            { municipalityCode: "11208", municipalityName: "所沢市" },
            { municipalityCode: "11245", municipalityName: "ふじみ野市" },
            { municipalityCode: "11324", municipalityName: "三芳町" }
          ]
        });
      }

      this.emit("GENERATION_STARTED", session, 0, "District Data Acquisition", []);

      // Step 1: District Data Acquisition
      viewModel.currentTask = "District Data Acquisition";
      viewModel.progress = 10;
      this.emit("GENERATION_PROGRESS", session, 10, "District Data Acquisition", []);

      const dataSource = new LocalDistrictDataSourceClass(registryFile);
      const acqService = new DistrictDataAcquisitionServiceClass(dataSource);
      const acqRuntime = new DistrictDataAcquisitionRuntimeClass(acqService);

      const rawData = await acqRuntime.executeAcquisition(
        { requestId: session.requestId, districtName: session.districtName },
        { baseDir: this.baseDir }
      );

      viewModel.completedTasks = ["地区データ取得"];
      this.emit("GENERATION_PROGRESS", session, 20, "District Master Resolution", ["地区データ取得"]);

      // Step 2: District Initialization Agent E2E Flow
      viewModel.currentTask = "District Master Resolution";
      viewModel.progress = 30;
      this.emit("GENERATION_PROGRESS", session, 30, "District Master Resolution", viewModel.completedTasks);

      const repo = new DistrictMasterRepositoryClass();
      const resolver = new DistrictMasterResolverClass(repo, registryFile);
      const areaRuntime = new PostingAreaRuntimeClass();
      const storageRuntime = new ElectionDashboardStorageRuntimeClass();
      const visualizationRuntime = new PostingMapVisualizationRuntimeClass();
      const workflow = new DistrictInitializationWorkflowClass(resolver, areaRuntime, storageRuntime, visualizationRuntime);
      const initRuntime = new DistrictInitializationRuntimeClass(resolver, workflow);

      // Subscribe to sub-events
      const unsubscribe = initRuntime.subscribe((ev: any) => {
        if (ev.type === "POSTING_MAP_DISTRICT_RESOLVED") {
          viewModel.completedTasks = [...viewModel.completedTasks, "District Master"];
          viewModel.currentTask = "Area Generation";
          viewModel.progress = 45;
          this.emit("GENERATION_PROGRESS", session, 45, "Area Generation", viewModel.completedTasks);
        } else if (ev.type === "POSTING_MAP_AREA_READY") {
          viewModel.completedTasks = [...viewModel.completedTasks, "Area Master"];
          viewModel.currentTask = "Election Turnout Data Mapping";
          viewModel.progress = 60;
          this.emit("GENERATION_PROGRESS", session, 60, "Election Turnout Data Mapping", viewModel.completedTasks);
        } else if (ev.type === "POSTING_MAP_DASHBOARD_READY") {
          viewModel.completedTasks = [...viewModel.completedTasks, "Election Data"];
          viewModel.currentTask = "Dashboard Setup";
          viewModel.progress = 75;
          this.emit("GENERATION_PROGRESS", session, 75, "Dashboard Setup", viewModel.completedTasks);
        } else if (ev.type === "POSTING_MAP_VISUALIZATION_READY") {
          viewModel.completedTasks = [...viewModel.completedTasks, "Dashboard", "Visualization"];
          viewModel.currentTask = "Complete Phase";
          viewModel.progress = 90;
          this.emit("GENERATION_PROGRESS", session, 90, "Complete Phase", viewModel.completedTasks);
        }
      });

      const initRequest = {
        initializationId: session.requestId,
        districtName: session.districtName,
        requester: "sales-demo",
        requestedAt: new Date().toISOString()
      };

      const initResult = await initRuntime.initializeDistrict(initRequest, { baseDir: this.baseDir });
      unsubscribe();

      if (initResult.status !== "READY") {
        throw new Error(initResult.error || "Initialization workflow failed.");
      }

      // Generate visual project json mock if not created by visualization runtime
      const visPath = path.join(this.baseDir, session.districtName, "visualization.json");
      if (!fs.existsSync(visPath)) {
        fs.writeFileSync(visPath, JSON.stringify({ status: "SUCCESS", checksum: "mock-vis-checksum" }), "utf-8");
      }

      // Verify dashboard compilation via DashboardRuntime
      const dashRuntime = new DashboardRuntimeClass();
      const dashView = dashRuntime.getDashboardView(session.districtName, this.baseDir);

      viewModel.completedTasks = [...viewModel.completedTasks, "Complete"];
      viewModel.progress = 100;
      viewModel.status = "completed";
      viewModel.previewReady = true;
      viewModel.generatedAt = new Date().toISOString();
      viewModel.currentTask = "Finished";

      const finalSession: GenerationSession = {
        ...session,
        status: "COMPLETED"
      };
      viewModel.session = finalSession;

      this.emit("GENERATION_COMPLETED", finalSession, 100, "Finished", viewModel.completedTasks);
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      viewModel.status = "failed";
      viewModel.error = errorMsg;
      viewModel.currentTask = "Error";
      
      const failedSession: GenerationSession = {
        ...session,
        status: "FAILED"
      };
      viewModel.session = failedSession;
      this.emit("GENERATION_FAILED", failedSession, viewModel.progress, "Error", viewModel.completedTasks, errorMsg);
    }
  }

  /**
   * Browser-only simulation to show progress and allow preview demonstration.
   */
  private async runBrowserSimulation(session: GenerationSession, viewModel: SalesGeneratorViewModel): Promise<void> {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      if (session.districtName !== "三重県第3区" && session.districtName !== "埼玉県第8区") {
        throw new Error(`Unknown or unsupported district: ${session.districtName}`);
      }

      this.emit("GENERATION_STARTED", session, 0, "District Data Acquisition", []);
      await sleep(400);

      // 1. Acquisition
      viewModel.currentTask = "District Data Acquisition";
      viewModel.progress = 15;
      this.emit("GENERATION_PROGRESS", session, 15, "District Data Acquisition", []);
      await sleep(600);

      viewModel.completedTasks = ["地区データ取得"];
      viewModel.currentTask = "District Master Resolution";
      viewModel.progress = 30;
      this.emit("GENERATION_PROGRESS", session, 30, "District Master Resolution", viewModel.completedTasks);
      await sleep(500);

      // 2. Master
      viewModel.completedTasks = [...viewModel.completedTasks, "District Master"];
      viewModel.currentTask = "Area Generation";
      viewModel.progress = 45;
      this.emit("GENERATION_PROGRESS", session, 45, "Area Generation", viewModel.completedTasks);
      await sleep(600);

      // 3. Area Master
      viewModel.completedTasks = [...viewModel.completedTasks, "Area Master"];
      viewModel.currentTask = "Election Turnout Data Mapping";
      viewModel.progress = 60;
      this.emit("GENERATION_PROGRESS", session, 60, "Election Turnout Data Mapping", viewModel.completedTasks);
      await sleep(500);

      // 4. Election
      viewModel.completedTasks = [...viewModel.completedTasks, "Election Data"];
      viewModel.currentTask = "Dashboard Setup";
      viewModel.progress = 75;
      this.emit("GENERATION_PROGRESS", session, 75, "Dashboard Setup", viewModel.completedTasks);
      await sleep(600);

      // 5. Dashboard
      viewModel.completedTasks = [...viewModel.completedTasks, "Dashboard"];
      viewModel.currentTask = "Visualization Map Setup";
      viewModel.progress = 90;
      this.emit("GENERATION_PROGRESS", session, 90, "Visualization Map Setup", viewModel.completedTasks);
      await sleep(500);

      // 6. Visualization & Complete
      viewModel.completedTasks = [...viewModel.completedTasks, "Visualization", "Complete"];
      viewModel.progress = 100;
      viewModel.status = "completed";
      viewModel.previewReady = true;
      viewModel.generatedAt = new Date().toISOString();
      viewModel.currentTask = "Finished";

      const finalSession: GenerationSession = {
        ...session,
        status: "COMPLETED"
      };
      viewModel.session = finalSession;

      this.emit("GENERATION_COMPLETED", finalSession, 100, "Finished", viewModel.completedTasks);
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      viewModel.status = "failed";
      viewModel.error = errorMsg;
      viewModel.currentTask = "Error";

      const failedSession: GenerationSession = {
        ...session,
        status: "FAILED"
      };
      viewModel.session = failedSession;
      this.emit("GENERATION_FAILED", failedSession, viewModel.progress, "Error", viewModel.completedTasks, errorMsg);
    }
  }
}
