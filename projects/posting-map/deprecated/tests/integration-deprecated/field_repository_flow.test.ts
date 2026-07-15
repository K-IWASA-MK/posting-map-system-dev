import { MockSpreadsheetClient } from '../../unit/typescript/infrastructure/mock/MockSpreadsheetClient';
import { SpreadsheetFlyerRepository } from '@infra/repository/field/SpreadsheetFlyerRepository';
import { DistributionDomainService } from '@domain/field/services/DistributionDomainService';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Integration Test FieldRepositoryFlow] Starting integration tests...');

  // Initialize Mock Spreadsheet Client
  const mockClient = MockSpreadsheetClient.createAndInject();
  const mockSs = mockClient.getSpreadsheet();

  const headers = ['ID', 'Owner ID', 'Area ID', 'Quantity', 'Status', 'Created At', 'Updated At'];
  const initialRows = [
    headers,
    ['STOCK-1', 'OWNER-1', 'AREA-1', '1000', 'AVAILABLE', String(Date.now()), String(Date.now())]
  ];
  mockSs.addSheet('Flyers', initialRows);

  const repository = new SpreadsheetFlyerRepository();
  const domainService = new DistributionDomainService();

  // 1. Retrieve Entity from Repository (Record -> Entity)
  const stock = await repository.findById('STOCK-1');
  assert(stock !== undefined, 'Stock entity must be fetched successfully');
  assert(stock!.getQuantity().getValue() === 1000, 'Initial quantity mismatch');
  assert(stock!.getStatus() === 'AVAILABLE', 'Initial status mismatch');

  // 2. Perform business operations in Domain Service (Entity -> Domain Service -> Updated Entity)
  const amountToReserve = new Quantity(300);
  const event = domainService.reserveFromStock(stock!, amountToReserve);
  
  assert(event.flyerStockId === 'STOCK-1', 'Event aggregate ID mismatch');
  assert(event.reservedAmount === 300, 'Event reserved amount mismatch');
  assert(event.remainingAmount === 700, 'Event remaining amount mismatch');
  assert(stock!.getQuantity().getValue() === 700, 'Stock entity quantity must be updated to 700');
  assert(stock!.getStatus() === 'RESERVED', 'Stock entity status must be RESERVED');

  // 3. Save Updated Entity via Repository (Entity -> Record)
  await repository.save(stock!);

  // 4. Fetch again to confirm persistence
  const reFetched = await repository.findById('STOCK-1');
  assert(reFetched !== undefined, 'Re-fetched stock must exist');
  assert(reFetched!.getQuantity().getValue() === 700, 'Persisted quantity must be 700');
  assert(reFetched!.getStatus() === 'RESERVED', 'Persisted status must be RESERVED');

  console.log('[Integration Test FieldRepositoryFlow] All integration tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
