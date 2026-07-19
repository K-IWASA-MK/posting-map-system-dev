export enum IsolationProfileType {
  FULLY_ISOLATED = 'FULLY_ISOLATED',
  NETWORK_DISABLED = 'NETWORK_DISABLED',
  LIMITED_NETWORK = 'LIMITED_NETWORK',
  READ_ONLY = 'READ_ONLY'
}

export interface IsolationProfile {
  profileName: IsolationProfileType;
  allowNetwork: boolean;
  readOnlyFilesystem: boolean;
  allowedCapabilities: string[];
}

export const StandardIsolationProfiles: Record<IsolationProfileType, IsolationProfile> = {
  [IsolationProfileType.FULLY_ISOLATED]: {
    profileName: IsolationProfileType.FULLY_ISOLATED,
    allowNetwork: false,
    readOnlyFilesystem: true,
    allowedCapabilities: []
  },
  [IsolationProfileType.NETWORK_DISABLED]: {
    profileName: IsolationProfileType.NETWORK_DISABLED,
    allowNetwork: false,
    readOnlyFilesystem: false,
    allowedCapabilities: ['FS_WRITE']
  },
  [IsolationProfileType.LIMITED_NETWORK]: {
    profileName: IsolationProfileType.LIMITED_NETWORK,
    allowNetwork: true,
    readOnlyFilesystem: false,
    allowedCapabilities: ['FS_WRITE', 'NET_CONNECT']
  },
  [IsolationProfileType.READ_ONLY]: {
    profileName: IsolationProfileType.READ_ONLY,
    allowNetwork: true,
    readOnlyFilesystem: true,
    allowedCapabilities: ['NET_CONNECT']
  }
};
