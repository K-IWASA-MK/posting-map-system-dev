import { FlyerStock } from '../entities/FlyerStock';

export interface IFlyerRepository {
  findByOwner(ownerId: string): Promise<FlyerStock[]>;
  save(flyer: FlyerStock): Promise<void>;
}
