import * as fs from 'fs';
import * as path from 'path';
import { ChildProcess } from 'child_process';
const child_process = require('child_process');

/**
 * ResourceLifecycleManager hooks timers, process spawning, process event listeners,
 * and handles file backup and restoration to isolate the test execution environment.
 */
export class ResourceLifecycleManager {
  private static originalSetTimeout = globalThis.setTimeout;
  private static originalSetInterval = globalThis.setInterval;
  private static originalClearTimeout = globalThis.clearTimeout;
  private static originalClearInterval = globalThis.clearInterval;
  private static originalSpawn = child_process.spawn;

  private static activeTimers = new Set<any>();
  private static activeProcesses = new Set<ChildProcess>();
  
  // Maps event name -> Array of original listener functions
  private static originalProcessListeners = new Map<string | symbol, any[]>();
  private static isHooked = false;

  private static readonly targetFiles = [
    path.join(process.cwd(), 'projects/posting-map/active/dashboard/clients/AssetRegistry.json'),
    path.join(process.cwd(), 'projects/posting-map/active/dashboard/clients/alerts.json'),
    path.join(process.cwd(), 'projects/posting-map/active/dashboard/clients/notifications-history.json'),
    path.join(process.cwd(), 'projects/posting-map/active/dashboard/clients/national-summary.json')
  ];

  /**
   * Installs hooks on global timers and child_process.spawn.
   * Also captures a snapshot of all active process listeners.
   */
  public static hook(): void {
    if (this.isHooked) return;

    // 1. Hook Timers
    (globalThis as any).setTimeout = (cb: (...args: any[]) => void, delay?: number, ...args: any[]) => {
      let timer: any;
      timer = this.originalSetTimeout((...cbArgs) => {
        this.activeTimers.delete(timer);
        cb(...cbArgs);
      }, delay, ...args);
      this.activeTimers.add(timer);
      return timer;
    };

    (globalThis as any).setInterval = (cb: (...args: any[]) => void, delay?: number, ...args: any[]) => {
      const timer = this.originalSetInterval(cb, delay, ...args);
      this.activeTimers.add(timer);
      return timer;
    };

    (globalThis as any).clearTimeout = (id: any) => {
      this.activeTimers.delete(id);
      this.originalClearTimeout(id);
    };

    (globalThis as any).clearInterval = (id: any) => {
      this.activeTimers.delete(id);
      this.originalClearInterval(id);
    };

    // 2. Hook Process Spawning
    (child_process as any).spawn = (command: string, args?: string[], options?: any) => {
      const child = this.originalSpawn(command, args, options);
      this.activeProcesses.add(child);
      child.once('exit', () => {
        this.activeProcesses.delete(child);
      });
      return child;
    };

    // 3. Snapshot Process Listeners
    this.originalProcessListeners.clear();
    const processEvents = process.eventNames();
    for (const event of processEvents) {
      this.originalProcessListeners.set(event, process.listeners(event));
    }

    this.isHooked = true;
  }

  /**
   * Backs up target configuration files.
   */
  public static backupFiles(): Map<string, string> {
    const backupMap = new Map<string, string>();
    for (const file of this.targetFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          backupMap.set(file, content);
        } catch (err) {
          console.error(`[ResourceLifecycleManager] Backup failed for ${file}:`, err);
        }
      }
    }
    return backupMap;
  }

  /**
   * Restores target configuration files to their original state.
   */
  public static restoreFiles(backupMap: Map<string, string>): number {
    let count = 0;
    
    // Restore or remove files
    for (const file of this.targetFiles) {
      const originalContent = backupMap.get(file);
      if (originalContent !== undefined) {
        try {
          fs.writeFileSync(file, originalContent, 'utf8');
          count++;
        } catch (err) {
          console.error(`[ResourceLifecycleManager] Restore failed for ${file}:`, err);
        }
      } else if (fs.existsSync(file)) {
        // If it wasn't there originally but exists now, delete it to prevent leak
        try {
          fs.unlinkSync(file);
          count++;
        } catch (err) {
          console.error(`[ResourceLifecycleManager] Cleanup deletion failed for ${file}:`, err);
        }
      }
    }
    return count;
  }

  /**
   * Clears all active timers, kills spawned child processes, and restores process event listeners.
   */
  public static cleanup(): { timersReleased: number; listenersRemoved: number; processesKilled: number } {
    let timersReleased = 0;
    let processesKilled = 0;
    let listenersRemoved = 0;

    // 1. Clear Timers
    for (const timer of this.activeTimers) {
      this.originalClearTimeout(timer);
      this.originalClearInterval(timer);
      timersReleased++;
    }
    this.activeTimers.clear();

    // 2. Kill Spawned Child Processes
    for (const child of this.activeProcesses) {
      if (!child.killed) {
        try {
          child.kill('SIGKILL');
          processesKilled++;
        } catch (err) {
          console.error(`[ResourceLifecycleManager] Process kill failed:`, err);
        }
      }
    }
    this.activeProcesses.clear();

    // 3. Restore Process Event Listeners
    const currentEvents = process.eventNames();
    for (const event of currentEvents) {
      const original = this.originalProcessListeners.get(event) || [];
      const current = process.listeners(event);
      
      for (const listener of current) {
        if (!original.includes(listener)) {
          process.removeListener(event, listener);
          listenersRemoved++;
        }
      }
    }

    // 4. Uninstall global hooks
    (globalThis as any).setTimeout = this.originalSetTimeout;
    (globalThis as any).setInterval = this.originalSetInterval;
    (globalThis as any).clearTimeout = this.originalClearTimeout;
    (globalThis as any).clearInterval = this.originalClearInterval;
    (child_process as any).spawn = this.originalSpawn;
    this.isHooked = false;

    return { timersReleased, listenersRemoved, processesKilled };
  }
}
