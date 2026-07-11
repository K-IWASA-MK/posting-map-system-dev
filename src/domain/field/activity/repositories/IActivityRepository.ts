import { DistributionActivity } from '../entities/DistributionActivity';

export interface IActivityRepository {
  findLatestByStaff(staffNo: string, limit: number): Promise<DistributionActivity[]>;
  save(activity: DistributionActivity): Promise<void>;
}
