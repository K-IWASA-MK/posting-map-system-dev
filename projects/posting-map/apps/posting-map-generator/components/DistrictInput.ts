import { SalesGeneratorViewModel } from "../SalesGeneratorViewModel";

export class DistrictInput {
  private element: HTMLElement;
  private inputElement: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private onGenerateCallback: ((districtName: string) => void) | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found.`);
    }
    this.element = container;
    this.render();
  }

  public onGenerate(callback: (districtName: string) => void): void {
    this.onGenerateCallback = callback;
  }

  public setEnabled(enabled: boolean): void {
    if (this.inputElement) this.inputElement.disabled = !enabled;
    if (this.submitButton) {
      this.submitButton.disabled = !enabled;
      if (enabled) {
        this.submitButton.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        this.submitButton.classList.add("opacity-50", "cursor-not-allowed");
      }
    }
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="space-y-6">
        <div>
          <label class="block text-xs uppercase tracking-widest text-secondary font-bold mb-3">作成する選挙区</label>
          <input type="text" id="district-name-input" 
                 class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold tracking-wide focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-white/20"
                 placeholder="例: 三重県第3区" />
        </div>

        <div class="flex flex-wrap gap-2 text-xs">
          <span class="text-secondary flex items-center mr-1">例:</span>
          <button type="button" class="example-btn px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all text-secondary hover:text-white">三重県第3区</button>
          <button type="button" class="example-btn px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all text-secondary hover:text-white">埼玉県第8区</button>
          <button type="button" class="example-btn px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all text-secondary hover:text-white">愛知県第11区</button>
        </div>

        <button id="posting-map-generate-btn" 
                class="w-full bg-primary hover:bg-primary/95 text-white rounded-2xl py-5 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.99] transition-all tracking-widest">
          POSTING MAP生成
        </button>
      </div>
    `;

    this.inputElement = this.element.querySelector("#district-name-input") as HTMLInputElement;
    this.submitButton = this.element.querySelector("#posting-map-generate-btn") as HTMLButtonElement;

    // Set up example button events
    const exampleBtns = this.element.querySelectorAll(".example-btn");
    exampleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (this.inputElement && !this.inputElement.disabled) {
          this.inputElement.value = btn.textContent || "";
          this.inputElement.dispatchEvent(new Event("input"));
        }
      });
    });

    // Set up form submission event
    if (this.submitButton) {
      this.submitButton.addEventListener("click", () => {
        if (this.onGenerateCallback && this.inputElement) {
          this.onGenerateCallback(this.inputElement.value);
        }
      });
    }
  }

  public bindViewModel(viewModel: SalesGeneratorViewModel): void {
    viewModel.subscribe((vm) => {
      const isIdleOrFailed = vm.status === "idle" || vm.status === "failed";
      this.setEnabled(isIdleOrFailed);
      if (this.inputElement && isIdleOrFailed && vm.status === "idle") {
        this.inputElement.value = vm.districtName;
      }
    });
  }
}
