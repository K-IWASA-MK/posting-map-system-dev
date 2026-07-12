import { DistributionActivity } from '../entities/DistributionActivity';
import { YearMonth } from '../../../common/valueobjects/YearMonth';

export interface IActivityRepository {
  findLatestByStaff(staffNo: string, limit: number): Promise<DistributionActivity[]>;
  findByPeriod(start: Date, end: Date): Promise<DistributionActivity[]>;
  findByYearMonth(workspaceId: string, yearMonth: YearMonth): Promise<DistributionActivity[]>;
  findAll(): Promise<DistributionActivity[]>;
  save(activity: DistributionActivity): Promise<void>;
}
