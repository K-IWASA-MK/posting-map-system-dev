import { IDistributorRepository } from '@domain/field/repositories/IDistributorRepository';
import { Distributor } from '@domain/field/entities/Distributor';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { DistributorDto } from '../dto/DistributorDto';

export class DistributionApplicationService {
  constructor(private distributorRepository: IDistributorRepository) {}

  public async getDistributor(id: string): Promise<DistributorDto | undefined> {
    const dist = await this.distributorRepository.findById(id);
    if (!dist) return undefined;
    return this.toDto(dist);
  }

  public async assignArea(distributorId: string, areaIdStr: string): Promise<DistributorDto> {
    const dist = await this.distributorRepository.findById(distributorId);
    if (!dist) {
      throw new Error(`Distributor not found: ${distributorId}`);
    }

    dist.assignArea(new AreaId(areaIdStr));
    await this.distributorRepository.save(dist);
    return this.toDto(dist);
  }

  public async activateDistributor(distributorId: string): Promise<DistributorDto> {
    const dist = await this.distributorRepository.findById(distributorId);
    if (!dist) {
      throw new Error(`Distributor not found: ${distributorId}`);
    }

    dist.activate();
    await this.distributorRepository.save(dist);
    return this.toDto(dist);
  }

  private toDto(dist: Distributor): DistributorDto {
    return {
      id: dist.id,
      name: dist.name,
      identityId: dist.identityId,
      status: dist.getStatus(),
      areaIds: dist.getAreaIds().map(id => id.getValue())
    };
  }
}
