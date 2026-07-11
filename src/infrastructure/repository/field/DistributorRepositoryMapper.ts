import { Distributor, DistributorStatus } from '@domain/field/entities/Distributor';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { DistributorRecord } from '../../dto/field/DistributorRecord';

export class DistributorRepositoryMapper {
  public static toEntity(record: DistributorRecord): Distributor {
    const status = record.status.toUpperCase();
    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      throw new Error(`Invalid distributor status: ${record.status}`);
    }

    const areaIds = record.areaIds.map(id => new AreaId(id));

    return new Distributor({
      id: record.id,
      name: record.name,
      identityId: record.identityId,
      areaIds,
      status: status as DistributorStatus
    });
  }

  public static toRecord(entity: Distributor): DistributorRecord {
    return {
      id: entity.id,
      name: entity.name,
      identityId: entity.identityId,
      areaIds: entity.getAreaIds().map(id => id.getValue()),
      status: entity.getStatus()
    };
  }
}
