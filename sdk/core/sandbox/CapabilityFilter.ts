export class CapabilityFilter {
  public verify(allowedCapabilities: string[], requestedAction: string): boolean {
    // If action requires a capability, check if it's allowed.
    // e.g. FS_WRITE or NET_CONNECT
    if (requestedAction === 'write_file' && !allowedCapabilities.includes('FS_WRITE')) {
      return false;
    }
    if (requestedAction === 'fetch_url' && !allowedCapabilities.includes('NET_CONNECT')) {
      return false;
    }
    return true;
  }
}
