import { SalesGeneratorViewModel } from "../SalesGeneratorViewModel";

export class PreviewLauncher {
  private element: HTMLElement;
  private previewBtn: HTMLButtonElement | null = null;
  private currentDistrictName: string = "";
  private onLaunchCallback: ((target: string, districtName: string) => void) | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found.`);
    }
    this.element = container;
    this.render();
  }

  public onLaunch(callback: (target: string, districtName: string) => void): void {
    this.onLaunchCallback = callback;
  }

  private render(): void {
    this.element.innerHTML = `
      <div id="preview-launcher-wrapper" class="hidden space-y-4 pt-4">
        <label class="block text-xs uppercase tracking-widest text-secondary font-bold mb-3">生成完了後</label>
        <button id="dashboard-preview-btn" 
                class="w-full bg-white text-black hover:bg-white/90 rounded-2xl py-5 text-base font-bold shadow-lg shadow-white/5 hover:shadow-white/10 active:scale-[0.99] transition-all tracking-widest">
          Dashboard Preview 起動
        </button>
      </div>
    `;

    this.previewBtn = this.element.querySelector("#dashboard-preview-btn") as HTMLButtonElement;

    if (this.previewBtn) {
      this.previewBtn.addEventListener("click", () => {
        if (this.onLaunchCallback && this.currentDistrictName) {
          this.onLaunchCallback("dashboard", this.currentDistrictName);
        } else {
          // Default redirection behavior if no callback set
          const targetUrl = `../dashboard/index.html?district=${encodeURIComponent(this.currentDistrictName)}`;
          window.open(targetUrl, "_blank");
        }
      });
    }
  }

  public bindViewModel(viewModel: SalesGeneratorViewModel): void {
    viewModel.subscribe((vm) => {
      const wrapper = this.element.querySelector("#preview-launcher-wrapper") as HTMLElement;
      this.currentDistrictName = vm.districtName;

      if (vm.status === "completed" && vm.previewReady) {
        if (wrapper) {
          wrapper.classList.remove("hidden");
          wrapper.classList.add("animate-fade-in");
        }
      } else {
        if (wrapper) wrapper.classList.add("hidden");
      }
    });
  }
}
