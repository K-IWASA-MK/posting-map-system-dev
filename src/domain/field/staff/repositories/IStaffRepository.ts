import { Staff } from '../entities/Staff';
import { YearMonth } from '../../../common/valueobjects/YearMonth';

export interface IStaffRepository {
  findByStaffNo(staffNo: string): Promise<Staff | undefined>;
  findByLineUserId(lineUserId: string): Promise<Staff | undefined>;
  findByWorkspace(workspaceId: string): Promise<Staff[]>;
  findNewStaffByMonth(workspaceId: string, yearMonth: YearMonth): Promise<Staff[]>;
  save(staff: Staff): Promise<void>;
}
