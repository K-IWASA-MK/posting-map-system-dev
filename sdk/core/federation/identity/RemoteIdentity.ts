export interface RemoteIdentity {
  readonly remoteId: string;
  readonly domainId: string;
  readonly principalName: string;
  readonly attributes: Record<string, string>;
  readonly roles: string[];
}
