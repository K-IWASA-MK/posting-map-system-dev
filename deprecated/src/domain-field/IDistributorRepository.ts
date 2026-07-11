import { Distributor } from '../entities/Distributor';

export interface IDistributorRepository {
  findById(id: string): Promise<Distributor | undefined>;
  save(distributor: Distributor): Promise<void>;
}
