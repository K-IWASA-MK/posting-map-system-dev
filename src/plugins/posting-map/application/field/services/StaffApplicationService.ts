import { IStaffRepository } from '@domain/field/staff/repositories/IStaffRepository';
import { Staff } from '@domain/field/staff/entities/Staff';
import { RegisterStaffCommand } from '../commands/RegisterStaffCommand';
import { StaffDto } from '../dto/StaffDto';

export class StaffApplicationService {
  constructor(private staffRepository: IStaffRepository) {}

  public async getStaff(staffNo: string): Promise<StaffDto | undefined> {
    const staff = await this.staffRepository.findByStaffNo(staffNo);
    if (!staff) return undefined;
    return this.toDto(staff);
  }

  public async getStaffByLineUserId(lineUserId: string): Promise<StaffDto | undefined> {
    const staff = await this.staffRepository.findByLineUserId(lineUserId);
    if (!staff) return undefined;
    return this.toDto(staff);
  }

  public async registerStaff(command: RegisterStaffCommand): Promise<StaffDto> {
    const existingByLine = await this.staffRepository.findByLineUserId(command.lineUserId);
    if (existingByLine) {
      return this.toDto(existingByLine);
    }

    let staffNo = command.staffNo;
    if (!staffNo) {
      staffNo = await this.staffRepository.getNextStaffNo(command.workspaceId);
    } else {
      const existing = await this.staffRepository.findByStaffNo(staffNo);
      if (existing) {
        throw new Error(`Staff with number ${staffNo} already exists`);
      }
    }

    const staff = new Staff({
      staffNo: staffNo,
      displayName: command.displayName,
      lineUserId: command.lineUserId,
      workspaceId: command.workspaceId
    });

    await this.staffRepository.save(staff);
    return this.toDto(staff);
  }

  private toDto(staff: Staff): StaffDto {
    return {
      staffNo: staff.staffNo,
      displayName: staff.displayName,
      lineUserId: staff.lineUserId,
      workspaceId: staff.workspaceId,
      createdAt: staff.createdAt.toISOString()
    };
  }
}
