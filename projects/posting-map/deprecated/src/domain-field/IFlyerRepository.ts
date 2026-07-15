import { FlyerStock } from '../entities/FlyerStock';

export interface IFlyerRepository {
  findByOwner(ownerId: string): Promise<FlyerStock[]>;
  findById(id: string): Promise<FlyerStock | undefined>;
  save(flyer: FlyerStock): Promise<void>;
}
