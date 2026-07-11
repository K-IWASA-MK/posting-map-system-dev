import { ReservationHandler } from '@api/field/ReservationHandler';
import { FlyerStockApplicationService } from '@application/field/services/FlyerStockApplicationService';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockFlyerStockApplicationService extends FlyerStockApplicationService {
  constructor() {
    super(null as any, null as any, null as any);
  }

  public async reserveStock(command: any): Promise<any> {
    if (command.flyerStockId === 'stock-fail') {
      return {
        success: false,
        eventIds: [],
        failureReason: 'Insufficient stock to reserve'
      };
    }
    return {
      success: true,
      stock: {
        id: command.flyerStockId,
        ownerId: 'owner-1',
        areaId: 'area-1',
        quantity: 600,
        status: 'RESERVED',
        updatedAt: new Date().toISOString()
      },
      eventIds: ['evt-123']
    };
  }
}

async function runTests() {
  console.log('[Test ReservationHandler] Running unit tests...');

  const service = new MockFlyerStockApplicationService();
  const handler = new ReservationHandler(service);
  const context = new ApiExecutionContext();

  // Test Case 1: Success Reservation
  {
    const request = new ApiRequest({
      method: 'POST',
      path: '/field/reservation',
      version: 'v2',
      requestId: 'req-1',
      body: {
        flyerStockId: 'stock-exist',
        distributorId: 'dist-exist',
        quantity: 400
      }
    });

    const response = await handler.execute(request, context);
    assert(response.success === true, 'Response must succeed');
    assert(response.status === 200, 'Status must be 200');
    assert(response.data.success === true, 'Payload success must be true');
    assert(response.data.stock.quantity === 600, 'Mapped stock quantity incorrect');
    assert(response.data.eventIds[0] === 'evt-123', 'Event ID must be mapped');
  }

  // Test Case 2: Validation Failure (negative quantity)
  {
    const request = new ApiRequest({
      method: 'POST',
      path: '/field/reservation',
      version: 'v2',
      requestId: 'req-2',
      body: {
        flyerStockId: 'stock-exist',
        distributorId: 'dist-exist',
        quantity: -10
      }
    });

    const response = await handler.execute(request, context);
    assert(response.success === false, 'Response must fail');
    assert(response.status === 400, 'Status must be 400');
    assert(response.error?.code === 'INVALID_INPUT', 'Error code must match');
  }

  // Test Case 3: Business Logic Failure (insufficient stock)
  {
    const request = new ApiRequest({
      method: 'POST',
      path: '/field/reservation',
      version: 'v2',
      requestId: 'req-3',
      body: {
        flyerStockId: 'stock-fail',
        distributorId: 'dist-exist',
        quantity: 1000
      }
    });

    const response = await handler.execute(request, context);
    assert(response.success === true, 'Application service catches and returns ReservationResult with success: false');
    assert(response.status === 200, 'Status must be 200');
    assert(response.data.success === false, 'Payload success must be false');
    assert(response.data.failureReason === 'Insufficient stock to reserve', 'Reason mismatch');
  }

  console.log('[Test ReservationHandler] All tests PASSED.');
}

runTests().catch(err => {
  console.error('[Test ReservationHandler] Failed:', err);
  process.exit(1);
});
