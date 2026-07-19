export interface DistrictInfo {
  readonly districtId: string;
  readonly districtName: string;
  readonly municipalities: readonly { readonly code: string; readonly name: string }[];
}

export interface DistrictResolver {
  resolve(districtName: string): DistrictInfo;
}
