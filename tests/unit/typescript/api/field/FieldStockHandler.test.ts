import { FieldStockHandler } from '@api/field/FieldStockHandler';
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

  public async getStock(id: string): Promise<any> {
    if (id === 'stock-exist') {
      return {
        id: 'stock-exist',
        ownerId: 'owner-1',
        areaId: 'area-1',
        quantity: 100,
        status: 'AVAILABLE',
        updatedAt: new Date().toISOString()
      };
    }
    return undefined;
  }
}

async function runTests() {
  console.log('[Test FieldStockHandler] Running unit tests...');

  const service = new MockFlyerStockApplicationService();
  const handler = new FieldStockHandler(service);
  const context = new ApiExecutionContext();

  // Test Case 1: Success retrieval
  {
    const request = new ApiRequest({
      method: 'GET',
      path: '/field/stocks/stock-exist',
      version: 'v2',
      requestId: 'req-1',
      pathParams: { id: 'stock-exist' }
    });

    const response = await handler.execute(request, context);
    assert(response.success === true, 'Response must be success');
    assert(response.status === 200, 'Status must be 200');
    assert(response.data.id === 'stock-exist', 'ID must match');
    assert(response.data.quantity === 100, 'Quantity must match');
  }

  // Test Case 2: Not Found
  {
    const request = new ApiRequest({
      method: 'GET',
      path: '/field/stocks/stock-none',
      version: 'v2',
      requestId: 'req-2',
      pathParams: { id: 'stock-none' }
    });

    const response = await handler.execute(request, context);
    assert(response.success === false, 'Response must fail');
    assert(response.status === 404, 'Status must be 404');
    assert(response.error?.code === 'ENTITY_NOT_FOUND', 'Error code must match');
  }

  // Test Case 3: Missing parameter ID
  {
    const request = new ApiRequest({
      method: 'GET',
      path: '/field/stocks/',
      version: 'v2',
      requestId: 'req-3',
      pathParams: { id: '' }
    });

    const response = await handler.execute(request, context);
    assert(response.success === false, 'Response must fail');
    assert(response.status === 400, 'Status must be 400');
    assert(response.error?.code === 'INVALID_INPUT', 'Error code must match');
  }

  console.log('[Test FieldStockHandler] All tests PASSED.');
}

runTests().catch(err => {
  console.error('[Test FieldStockHandler] Failed:', err);
  process.exit(1);
});
