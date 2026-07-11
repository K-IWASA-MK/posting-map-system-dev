import { IFlyerHoldingRepository } from '@domain/field/holding/repositories/IFlyerHoldingRepository';
import { FlyerHolding } from '@domain/field/holding/entities/FlyerHolding';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { DeclareHoldingCommand } from '../commands/DeclareHoldingCommand';
import { HoldingDto } from '../dto/HoldingDto';
import { ApplicationEventPublisher } from '../../events/ApplicationEventPublisher';
import { FlyerHoldingCreatedEvent } from '@domain/field/events/FieldEvent';

export class HoldingApplicationService {
  constructor(
    private holdingRepository: IFlyerHoldingRepository,
    private eventPublisher: ApplicationEventPublisher
  ) {}

  public async getHolding(staffNo: string): Promise<HoldingDto | undefined> {
    const holding = await this.holdingRepository.findByStaffNo(staffNo);
    if (!holding) return undefined;
    return this.toDto(holding);
  }

  public async declareHolding(command: DeclareHoldingCommand): Promise<HoldingDto> {
    let holding = await this.holdingRepository.findByStaffNo(command.staffNo);
    
    if (holding) {
      holding.updateQuantity(new Quantity(command.quantity));
    } else {
      holding = new FlyerHolding({
        staffNo: command.staffNo,
        quantity: new Quantity(command.quantity)
      });
      
      const event = new FlyerHoldingCreatedEvent(command.staffNo, command.quantity);
      this.eventPublisher.publish(event);
    }

    await this.holdingRepository.save(holding);
    return this.toDto(holding);
  }

  public async getAllRawHoldings(): Promise<any[]> {
    return await this.holdingRepository.findAllRaw();
  }

  private toDto(holding: FlyerHolding): HoldingDto {
    return {
      staffNo: holding.staffNo,
      quantity: holding.getQuantity().getValue(),
      updatedAt: holding.getUpdatedAt().toISOString()
    };
  }
}
