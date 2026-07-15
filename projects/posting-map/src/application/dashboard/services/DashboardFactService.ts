import { IActivityRepository } from '../../../domain/field/activity/repositories/IActivityRepository';
import { IFlyerHoldingRepository } from '../../../domain/field/holding/repositories/IFlyerHoldingRepository';
import { DistributionActivity } from '../../../domain/field/activity/entities/DistributionActivity';
import { FlyerHolding } from '../../../domain/field/holding/entities/FlyerHolding';
import { Quantity } from '../../../domain/field/valueobjects/Quantity';
import { DashboardFactDto } from '../dto/DashboardFactDto';
import { DashboardFilterDto } from '../dto/DashboardFilterDto';
import { FlyerHoldingDto } from '../dto/FlyerHoldingDto';

export class DashboardFactService {
  constructor(
    private activityRepo: IActivityRepository,
    private holdingRepo: IFlyerHoldingRepository
  ) {}

  public async getDistributionFacts(filter: DashboardFilterDto): Promise<{ items: DashboardFactDto[], totalCount: number }> {
    const activities = await this.activityRepo.findAll();

    // Filtering
    let filtered = activities.filter(activity => {
      const dto = this.mapToFactDto(activity);
      
      if (filter.date && dto.date !== filter.date) return false;
      if (filter.district && dto.district !== filter.district) return false;
      if (filter.area && dto.area !== filter.area) return false;
      if (filter.minDistributionCount !== undefined && dto.distributionCount < filter.minDistributionCount) return false;
      if (filter.maxDistributionCount !== undefined && dto.distributionCount > filter.maxDistributionCount) return false;
      if (filter.syncStatus && dto.syncStatus !== filter.syncStatus) return false;
      
      return true;
    });

    // Sorting
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const dtoA = this.mapToFactDto(a);
        const dtoB = this.mapToFactDto(b);
        const valA = (dtoA as any)[filter.sortBy!] || '';
        const valB = (dtoB as any)[filter.sortBy!] || '';

        if (valA < valB) return filter.sortDirection === 'desc' ? 1 : -1;
        if (valA > valB) return filter.sortDirection === 'desc' ? -1 : 1;
        return 0;
      });
    }

    const totalCount = filtered.length;

    // Pagination
    if (filter.page !== undefined && filter.limit !== undefined) {
      const startIndex = (filter.page - 1) * filter.limit;
      filtered = filtered.slice(startIndex, startIndex + filter.limit);
    }

    const items = filtered.map(a => this.mapToFactDto(a));
    return { items, totalCount };
  }

  public async getFactDetail(id: string): Promise<DashboardFactDto | null> {
    const activity = await this.activityRepo.findById(id);
    if (!activity) return null;
    return this.mapToFactDto(activity);
  }

  public async getFlyerHoldings(): Promise<FlyerHoldingDto[]> {
    const holdings = await this.holdingRepo.findAll();
    return holdings.map(h => this.mapToHoldingDto(h));
  }

  public async addFlyerHolding(dto: FlyerHoldingDto): Promise<void> {
    const holding = new FlyerHolding({
      staffNo: dto.keeper,
      quantity: new Quantity(dto.currentHoldings),
      updatedAt: new Date(dto.updatedAt),
      cityName: dto.location
    });
    await this.holdingRepo.save(holding);
  }

  public async updateFlyerHolding(dto: FlyerHoldingDto): Promise<void> {
    const holding = new FlyerHolding({
      staffNo: dto.keeper,
      quantity: new Quantity(dto.currentHoldings),
      updatedAt: new Date(dto.updatedAt),
      cityName: dto.location
    });
    await this.holdingRepo.save(holding);
  }

  public async deleteFlyerHolding(keeper: string): Promise<void> {
    await this.holdingRepo.delete(keeper);
  }

  private mapToFactDto(activity: DistributionActivity): DashboardFactDto {
    const dt = activity.occurredAt;
    const dateStr = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
    
    return {
      id: activity.id,
      date: dateStr,
      district: '-', // Activity does not track workspace directly
      area: activity.areaId ? activity.areaId.getValue() : '-',
      distributionCount: activity.reportedQuantity.getValue(),
      syncStatus: activity.getStatus() === 'COMPLETED' ? 'SYNCED' : 'UNSYNCED',
      gpsEvidence: activity.gpsEvidence?.location ? `${activity.gpsEvidence.location.latitude},${activity.gpsEvidence.location.longitude}` : null,
      photoEvidence: activity.photoEvidence?.photoUrl || null
    };
  }

  private mapToHoldingDto(holding: FlyerHolding): FlyerHoldingDto {
    return {
      holdingId: holding.staffNo,
      workspaceId: 'DEFAULT', // Simplified for single-tenant or handled externally
      location: holding.cityName,
      keeper: holding.staffNo,
      currentHoldings: holding.getQuantity().getValue(),
      updatedAt: holding.getUpdatedAt().toISOString()
    };
  }
}
