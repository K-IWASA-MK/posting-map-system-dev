export interface IGitAdapter {
  clone(url: string, path: string): Promise<void>;
  fetch(path: string): Promise<void>;
  pull(path: string): Promise<void>;
  push(path: string, branch: string): Promise<void>;
  status(path: string): Promise<string>;
  diff(path: string): Promise<string>;
  checkout(path: string, branch: string): Promise<void>;
  commit(path: string, message: string): Promise<void>;
  tag(path: string, tag: string): Promise<void>;
  stash(path: string): Promise<void>;
  clean(path: string): Promise<void>;
  gc(path: string): Promise<void>;
  
  // Existing from previous sprint
  addRemote(path: string, remoteUrl: string): Promise<void>;
  pushInitial(path: string, defaultBranch?: string): Promise<void>;
  pushTags(path: string): Promise<void>;
}
