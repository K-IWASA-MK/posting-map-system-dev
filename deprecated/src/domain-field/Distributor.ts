import { AreaId } from '../valueobjects/AreaId';

export type DistributorStatus = 'ACTIVE' | 'INACTIVE';

export class Distributor {
  public readonly id: string;
  public readonly name: string;
  public readonly identityId: string;
  private areaIds: AreaId[];
  private status: DistributorStatus;

  constructor(params: {
    id: string;
    name: string;
    identityId: string;
    areaIds: AreaId[];
    status: DistributorStatus;
  }) {
    if (!params.id || params.id.trim().length === 0) {
      throw new Error("Distributor ID cannot be empty");
    }
    if (!params.name || params.name.trim().length === 0) {
      throw new Error("Distributor name cannot be empty");
    }
    if (!params.identityId || params.identityId.trim().length === 0) {
      throw new Error("Distributor identity ID cannot be empty");
    }
    this.id = params.id;
    this.name = params.name;
    this.identityId = params.identityId;
    this.areaIds = [...params.areaIds];
    this.status = params.status;
  }

  public getAreaIds(): AreaId[] {
    return [...this.areaIds];
  }

  public getStatus(): DistributorStatus {
    return this.status;
  }

  public activate(): void {
    this.status = 'ACTIVE';
  }

  public deactivate(): void {
    this.status = 'INACTIVE';
  }

  public assignArea(areaId: AreaId): void {
    if (this.areaIds.some(id => id.equals(areaId))) {
      return;
    }
    this.areaIds.push(areaId);
  }

  public unassignArea(areaId: AreaId): void {
    this.areaIds = this.areaIds.filter(id => !id.equals(areaId));
  }
}
