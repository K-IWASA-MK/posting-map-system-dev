import { FlyerHolding } from '../entities/FlyerHolding';

export interface IFlyerHoldingRepository {
  findByStaffNo(staffNo: string): Promise<FlyerHolding | undefined>;
  save(holding: FlyerHolding): Promise<void>;
}
