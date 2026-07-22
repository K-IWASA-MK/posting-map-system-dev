import { SalesGeneratorViewModel } from "./SalesGeneratorViewModel";
import { SalesGeneratorRuntime } from "./SalesGeneratorRuntime";
import { DistrictInput } from "./components/DistrictInput";
import { ProgressPanel } from "./components/ProgressPanel";
import { PreviewLauncher } from "./components/PreviewLauncher";

export class SalesGeneratorApp {
  private readonly viewModel: SalesGeneratorViewModel;
  private readonly runtime: SalesGeneratorRuntime;

  private districtInput!: DistrictInput;
  private progressPanel!: ProgressPanel;
  private previewLauncher!: PreviewLauncher;

  constructor(baseDir?: string) {
    this.viewModel = new SalesGeneratorViewModel();
    this.runtime = new SalesGeneratorRuntime(baseDir);
  }

  /**
   * Initializes components and binds them to the view model.
   */
  public mount(containers: {
    inputContainerId: string;
    progressContainerId: string;
    previewContainerId: string;
  }): void {
    // 1. Initialize UI elements
    this.districtInput = new DistrictInput(containers.inputContainerId);
    this.progressPanel = new ProgressPanel(containers.progressContainerId);
    this.previewLauncher = new PreviewLauncher(containers.previewContainerId);

    // 2. Bind views to reactive viewModel
    this.districtInput.bindViewModel(this.viewModel);
    this.progressPanel.bindViewModel(this.viewModel);
    this.previewLauncher.bindViewModel(this.viewModel);

    // 3. Connect view events to Runtime trigger
    this.districtInput.onGenerate((districtName) => {
      this.runtime.generate(districtName, this.viewModel).catch((err) => {
        console.error("[SalesGeneratorApp] Runtime error:", err);
      });
    });

    // 4. Connect Preview launcher events
    this.previewLauncher.onLaunch((target, districtName) => {
      this.launchPreview(target, districtName);
    });

    // Subscribing to runtime updates
    this.runtime.subscribe((event) => {
      console.log(`[SalesGeneratorApp] Runtime Event [${event.type}] for ${event.districtName}: progress=${event.progress}%, currentTask=${event.currentTask}`);
    });
  }

  private launchPreview(target: string, districtName: string): void {
    console.log(`[SalesGeneratorApp] Launching target '${target}' for ${districtName}`);
    
    // Redirect to the existing Dashboard Runtime UI
    const targetUrl = `../dashboard/index.html?district=${encodeURIComponent(districtName)}`;
    
    // In a browser window
    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank");
    } else {
      console.log(`[SalesGeneratorApp] (Node Mock) Redirecting simulation to: ${targetUrl}`);
    }
  }

  public getViewModel(): SalesGeneratorViewModel {
    return this.viewModel;
  }

  public getRuntime(): SalesGeneratorRuntime {
    return this.runtime;
  }
}
