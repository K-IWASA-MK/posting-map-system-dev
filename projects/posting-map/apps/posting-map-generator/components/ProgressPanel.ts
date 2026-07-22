import { SalesGeneratorViewModel } from "../SalesGeneratorViewModel";

export class ProgressPanel {
  private element: HTMLElement;
  private tasks: { id: string; label: string }[] = [
    { id: "地区データ取得", label: "地区データ取得" },
    { id: "District Master", label: "District Master" },
    { id: "Area Master", label: "Area Master" },
    { id: "Election Data", label: "Election Data" },
    { id: "Dashboard", label: "Dashboard" },
    { id: "Visualization", label: "Visualization" },
    { id: "Complete", label: "Complete" }
  ];

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found.`);
    }
    this.element = container;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <label class="block text-xs uppercase tracking-widest text-secondary font-bold">生成状況</label>
          <span id="progress-percentage-text" class="text-sm font-extrabold text-primary tracking-widest">待機中</span>
        </div>

        <!-- Progress bar track -->
        <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div id="progress-bar-fill" class="h-full bg-primary transition-all duration-300 w-0"></div>
        </div>

        <!-- Currently Running Agent display -->
        <div id="running-agent-wrapper" class="hidden flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-secondary">
          <div class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
          <div>現在実行中のAI社員: <span id="running-agent-name" class="text-white font-bold">None</span></div>
        </div>

        <!-- Error display -->
        <div id="progress-error-display" class="hidden p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 font-semibold leading-relaxed">
        </div>

        <!-- Progress items checklist -->
        <div class="space-y-3.5 pt-2">
          ${this.tasks.map(task => `
            <div id="task-row-${task.id}" class="flex items-center gap-4 text-sm font-semibold opacity-30 transition-all duration-300">
              <div id="task-checkbox-${task.id}" class="w-5 h-5 rounded border border-white/20 flex items-center justify-center text-[10px] text-white font-bold bg-white/5 transition-all">
                
              </div>
              <span class="tracking-wide">${task.label}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  public bindViewModel(viewModel: SalesGeneratorViewModel): void {
    viewModel.subscribe((vm) => {
      const fill = this.element.querySelector("#progress-bar-fill") as HTMLElement;
      const pctText = this.element.querySelector("#progress-percentage-text") as HTMLElement;
      const errorDisplay = this.element.querySelector("#progress-error-display") as HTMLElement;
      const agentWrapper = this.element.querySelector("#running-agent-wrapper") as HTMLElement;
      const agentName = this.element.querySelector("#running-agent-name") as HTMLElement;

      // Update bar and percentage text
      if (vm.status === "idle") {
        if (fill && fill.style) fill.style.width = "0%";
        if (pctText) pctText.textContent = "待機中";
        if (errorDisplay && errorDisplay.classList) errorDisplay.classList.add("hidden");
        if (agentWrapper && agentWrapper.classList) agentWrapper.classList.add("hidden");
      } else if (vm.status === "running") {
        if (fill && fill.style) fill.style.width = `${vm.progress}%`;
        if (pctText) pctText.textContent = `生成中 (${vm.progress}%)`;
        if (errorDisplay && errorDisplay.classList) errorDisplay.classList.add("hidden");

        // Dynamic Agent display
        if (agentWrapper && agentName && agentWrapper.classList) {
          if (vm.currentTask) {
            agentWrapper.classList.remove("hidden");
            agentName.textContent = vm.currentTask;
          } else {
            agentWrapper.classList.add("hidden");
          }
        }
      } else if (vm.status === "completed") {
        if (fill && fill.style) fill.style.width = "100%";
        if (pctText) pctText.textContent = "生成完了";
        if (errorDisplay && errorDisplay.classList) errorDisplay.classList.add("hidden");
        if (agentWrapper && agentWrapper.classList) agentWrapper.classList.add("hidden");
      } else if (vm.status === "failed") {
        if (fill && fill.style) fill.style.width = `${vm.progress}%`;
        if (pctText) pctText.textContent = "生成失敗";
        if (agentWrapper && agentWrapper.classList) agentWrapper.classList.add("hidden");

        if (errorDisplay && vm.error) {
          if (errorDisplay.classList) errorDisplay.classList.remove("hidden");
          errorDisplay.textContent = `❌ エラー: ${vm.error}`;
        }
      }

      // Update checkboxes state
      this.tasks.forEach(task => {
        const row = this.element.querySelector(`#task-row-${task.id}`) as HTMLElement;
        const box = this.element.querySelector(`#task-checkbox-${task.id}`) as HTMLElement;

        if (row && box) {
          const isCompleted = vm.completedTasks.includes(task.id);
          
          if (isCompleted) {
            if (row.classList) {
              row.classList.remove("opacity-30");
              row.classList.add("opacity-100", "text-white");
            }
            box.innerHTML = "✓";
            if (box.classList) {
              box.classList.remove("bg-white/5", "border-white/20");
              box.classList.add("bg-primary", "border-primary");
            }
          } else {
            if (row.classList) {
              row.classList.remove("opacity-100", "text-white");
              row.classList.add("opacity-30");
            }
            box.innerHTML = "";
            if (box.classList) {
              box.classList.remove("bg-primary", "border-primary");
              box.classList.add("bg-white/5", "border-white/20");
            }
          }
        }
      });
    });
  }
}
