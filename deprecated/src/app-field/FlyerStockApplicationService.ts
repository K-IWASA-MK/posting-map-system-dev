import { IFlyerRepository } from '@domain/field/repositories/IFlyerRepository';
import { DistributionDomainService } from '@domain/field/services/DistributionDomainService';
import { FlyerStock } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { ReserveFlyerCommand } from '../commands/ReserveFlyerCommand';
import { CreateFlyerStockCommand } from '../commands/CreateFlyerStockCommand';
import { FlyerStockDto } from '../dto/FlyerStockDto';
import { ReservationResult } from '../dto/ReservationResult';
import { ApplicationEventPublisher } from '../../events/ApplicationEventPublisher';

export class FlyerStockApplicationService {
  constructor(
    private flyerRepository: IFlyerRepository,
    private domainService: DistributionDomainService,
    private eventPublisher: ApplicationEventPublisher
  ) {}

  public async getStock(id: string): Promise<FlyerStockDto | undefined> {
    const stock = await this.flyerRepository.findById(id);
    if (!stock) return undefined;
    return this.toDto(stock);
  }

  public async createStock(command: CreateFlyerStockCommand): Promise<FlyerStockDto> {
    const existing = await this.flyerRepository.findById(command.flyerStockId);
    if (existing) {
      throw new Error(`Flyer stock with ID ${command.flyerStockId} already exists`);
    }

    const stock = new FlyerStock({
      id: command.flyerStockId,
      ownerId: command.ownerId,
      areaId: new AreaId(command.areaId),
      quantity: new Quantity(command.quantity),
      status: 'AVAILABLE'
    });

    await this.flyerRepository.save(stock);
    return this.toDto(stock);
  }

  public async reserveStock(command: ReserveFlyerCommand): Promise<ReservationResult> {
    try {
      const stock = await this.flyerRepository.findById(command.flyerStockId);
      if (!stock) {
        return {
          success: false,
          eventIds: [],
          failureReason: `Flyer stock not found: ${command.flyerStockId}`
        };
      }

      // Domain Rule evaluation and Entity transition delegated to Domain Service
      const event = this.domainService.reserveFromStock(stock, new Quantity(command.quantity));

      // Persistence
      await this.flyerRepository.save(stock);

      // Event Publish
      this.eventPublisher.publish(event);

      return {
        success: true,
        stock: this.toDto(stock),
        eventIds: [event.eventId]
      };
    } catch (e: any) {
      return {
        success: false,
        eventIds: [],
        failureReason: e.message || "Unknown error during reservation"
      };
    }
  }

  private toDto(stock: FlyerStock): FlyerStockDto {
    return {
      id: stock.id,
      ownerId: stock.ownerId,
      areaId: stock.areaId.getValue(),
      quantity: stock.getQuantity().getValue(),
      status: stock.getStatus(),
      updatedAt: stock.getUpdatedAt().toISOString()
    };
  }
}
