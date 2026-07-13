export interface DistributorRecord {
  id: string;
  name: string;
  identityId: string;
  areaIds: string[]; // List of area ID strings
  status: string;
}
