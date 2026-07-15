import { FlyerHolding } from '../entities/FlyerHolding';

export interface IFlyerHoldingRepository {
  findByStaffNo(staffNo: string): Promise<FlyerHolding | undefined>;
  /** @deprecated Backward Compatibility */
  findAllRaw(): Promise<any[]>;
  findAll(): Promise<FlyerHolding[]>;
  save(holding: FlyerHolding): Promise<void>;
  delete(staffNo: string): Promise<void>;
}
