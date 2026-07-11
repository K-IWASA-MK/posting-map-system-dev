import { FlyerStockApplicationService } from '@application/field/services/FlyerStockApplicationService';
import { IFlyerRepository } from '@domain/field/repositories/IFlyerRepository';
import { DistributionDomainService } from '@domain/field/services/DistributionDomainService';
import { FlyerStock } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { ReserveFlyerCommand } from '@application/field/commands/ReserveFlyerCommand';
import { CreateFlyerStockCommand } from '@application/field/commands/CreateFlyerStockCommand';
import { ApplicationEventPublisher } from '@application/events/ApplicationEventPublisher';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockFlyerRepository implements IFlyerRepository {
  public db = new Map<string, FlyerStock>();

  public async findByOwner(ownerId: string): Promise<FlyerStock[]> {
    return Array.from(this.db.values()).filter(f => f.ownerId === ownerId);
  }

  public async findById(id: string): Promise<FlyerStock | undefined> {
    return this.db.get(id);
  }

  public async save(flyer: FlyerStock): Promise<void> {
    this.db.set(flyer.id, flyer);
  }
}

async function runTests() {
  console.log('[Test FlyerStockApplicationService] Verifying service...');

  const repo = new MockFlyerRepository();
  const domainService = new DistributionDomainService();
  const publisher = new ApplicationEventPublisher();
  const service = new FlyerStockApplicationService(repo, domainService, publisher);

  // 1. Create Stock
  {
    const command = new CreateFlyerStockCommand('STOCK-1', 'OWNER-1', 'AREA-1', 1000);
    const dto = await service.createStock(command);
    assert(dto.id === 'STOCK-1', 'ID mismatch');
    assert(dto.quantity === 1000, 'Quantity mismatch');
    assert(dto.status === 'AVAILABLE', 'Status mismatch');
  }

  // 2. Retrieve Stock
  {
    const dto = await service.getStock('STOCK-1');
    assert(dto !== undefined, 'Stock should be found');
    assert(dto?.quantity === 1000, 'Quantity mismatch');
  }

  // 3. Reserve Stock Success
  {
    const command = new ReserveFlyerCommand('STOCK-1', 'DIST-1', 400);
    const result = await service.reserveStock(command);
    assert(result.success === true, 'Reservation should succeed');
    assert(result.stock?.quantity === 600, 'Stock must decrease');
    assert(result.stock?.status === 'RESERVED', 'Status must transition to RESERVED');
    assert(result.eventIds.length === 1, 'Event ID must be returned');
    assert(publisher.publishedEvents.length === 1, 'Event must be published');
  }

  // 4. Reserve Stock Insufficient Stock Failure
  {
    const command = new ReserveFlyerCommand('STOCK-1', 'DIST-1', 700);
    const result = await service.reserveStock(command);
    assert(result.success === false, 'Reservation must fail');
    assert(result.failureReason !== undefined, 'Failure reason must be set');
    assert(result.eventIds.length === 0, 'No event should be issued');
  }

  console.log('[Test FlyerStockApplicationService] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
