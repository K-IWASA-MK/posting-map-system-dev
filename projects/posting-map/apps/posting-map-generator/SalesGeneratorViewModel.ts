export interface GenerationSession {
  readonly sessionId: string;
  readonly requestId: string;
  readonly districtId: string;
  readonly districtName: string;
  readonly startedAt: string;
  readonly status: "RUNNING" | "COMPLETED" | "FAILED";
}

export class SalesGeneratorViewModel {
  private _districtName: string = "";
  private _status: "idle" | "running" | "completed" | "failed" = "idle";
  private _progress: number = 0;
  private _currentTask: string = "";
  private _completedTasks: string[] = [];
  private _previewReady: boolean = false;
  private _generatedAt: string | null = null;
  private _session: GenerationSession | null = null;
  private _error: string | null = null;

  private readonly listeners: Set<(vm: SalesGeneratorViewModel) => void> = new Set();

  public subscribe(listener: (vm: SalesGeneratorViewModel) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error("[SalesGeneratorViewModel] Listener error:", err);
      }
    }
  }

  // Getters and Setters
  public get districtName(): string { return this._districtName; }
  public set districtName(value: string) {
    if (this._districtName !== value) {
      this._districtName = value;
      this.notify();
    }
  }

  public get status(): "idle" | "running" | "completed" | "failed" { return this._status; }
  public set status(value: "idle" | "running" | "completed" | "failed") {
    if (this._status !== value) {
      this._status = value;
      this.notify();
    }
  }

  public get progress(): number { return this._progress; }
  public set progress(value: number) {
    if (this._progress !== value) {
      this._progress = value;
      this.notify();
    }
  }

  public get currentTask(): string { return this._currentTask; }
  public set currentTask(value: string) {
    if (this._currentTask !== value) {
      this._currentTask = value;
      this.notify();
    }
  }

  public get completedTasks(): string[] { return this._completedTasks; }
  public set completedTasks(value: string[]) {
    this._completedTasks = [...value];
    this.notify();
  }

  public get previewReady(): boolean { return this._previewReady; }
  public set previewReady(value: boolean) {
    if (this._previewReady !== value) {
      this._previewReady = value;
      this.notify();
    }
  }

  public get generatedAt(): string | null { return this._generatedAt; }
  public set generatedAt(value: string | null) {
    if (this._generatedAt !== value) {
      this._generatedAt = value;
      this.notify();
    }
  }

  public get session(): GenerationSession | null { return this._session; }
  public set session(value: GenerationSession | null) {
    this._session = value;
    this.notify();
  }

  public get error(): string | null { return this._error; }
  public set error(value: string | null) {
    if (this._error !== value) {
      this._error = value;
      this.notify();
    }
  }

  public reset(): void {
    this._status = "idle";
    this._progress = 0;
    this._currentTask = "";
    this._completedTasks = [];
    this._previewReady = false;
    this._generatedAt = null;
    this._session = null;
    this._error = null;
    this.notify();
  }
}
