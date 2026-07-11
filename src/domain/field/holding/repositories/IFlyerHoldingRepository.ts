import { FlyerHolding } from '../entities/FlyerHolding';

export interface IFlyerHoldingRepository {
  findByStaffNo(staffNo: string): Promise<FlyerHolding | undefined>;
  findAllRaw(): Promise<any[]>;
  save(holding: FlyerHolding): Promise<void>;
}
