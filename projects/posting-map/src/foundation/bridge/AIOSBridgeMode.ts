export enum AIOSBridgeMode {
  STUB = 'STUB',
  LIVE = 'LIVE'
}

export function resolveBridgeMode(modeString?: string): AIOSBridgeMode {
  if (!modeString) {
    return AIOSBridgeMode.STUB;
  }
  const normalized = modeString.trim().toUpperCase();
  if (normalized === 'LIVE') {
    return AIOSBridgeMode.LIVE;
  }
  return AIOSBridgeMode.STUB;
}
