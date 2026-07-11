import { Staff } from '../entities/Staff';

export interface IStaffRepository {
  findByStaffNo(staffNo: string): Promise<Staff | undefined>;
  findByLineUserId(lineUserId: string): Promise<Staff | undefined>;
  save(staff: Staff): Promise<void>;
}
