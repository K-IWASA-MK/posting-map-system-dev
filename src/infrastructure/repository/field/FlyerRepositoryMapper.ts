import { FlyerStock, FlyerStockStatus } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { FlyerStockRecord } from '../../dto/field/FlyerStockRecord';

export class FlyerRepositoryMapper {
  public static toEntity(record: FlyerStockRecord): FlyerStock {
    // 不正データ防御 (Spreadsheetは外部入力)
    if (record.quantity < 0) {
      throw new Error(`Invalid stock quantity: ${record.quantity}. Must be non-negative.`);
    }
    const status = record.status.toUpperCase();
    if (status !== 'AVAILABLE' && status !== 'RESERVED' && status !== 'DEPLETED') {
      throw new Error(`Invalid stock status: ${record.status}`);
    }

    return new FlyerStock({
      id: record.id,
      ownerId: record.ownerId,
      areaId: new AreaId(record.areaId),
      quantity: new Quantity(record.quantity),
      status: status as FlyerStockStatus,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    });
  }

  public static toRecord(entity: FlyerStock): FlyerStockRecord {
    return {
      id: entity.id,
      ownerId: entity.ownerId,
      areaId: entity.areaId.getValue(),
      quantity: entity.getQuantity().getValue(),
      status: entity.getStatus(),
      createdAt: entity.createdAt.getTime(),
      updatedAt: entity.getUpdatedAt().getTime()
    };
  }
}
