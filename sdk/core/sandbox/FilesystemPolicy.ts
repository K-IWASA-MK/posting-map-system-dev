export class FilesystemPolicy {
  public validate(readOnly: boolean, volumePath: string): boolean {
    // Enforce read-only filesystem validation
    // If readOnly is true and the volume attempts mounting /tmp as read-write, block it.
    if (readOnly && volumePath.includes(':rw')) {
      return false;
    }
    return true;
  }
}
