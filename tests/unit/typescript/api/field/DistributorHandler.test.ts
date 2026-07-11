import { DistributorHandler } from '@api/field/DistributorHandler';
import { DistributionApplicationService } from '@application/field/services/DistributionApplicationService';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockDistributionApplicationService extends DistributionApplicationService {
  constructor() {
    super(null as any);
  }

  public async getDistributor(id: string): Promise<any> {
    if (id === 'dist-exist') {
      return {
        id: 'dist-exist',
        name: 'Distributor A',
        identityId: 'id-1',
        status: 'ACTIVE',
        areaIds: ['area-1']
      };
    }
    return undefined;
  }
}

async function runTests() {
  console.log('[Test DistributorHandler] Running unit tests...');

  const service = new MockDistributionApplicationService();
  const handler = new DistributorHandler(service);
  const context = new ApiExecutionContext();

  // Test Case 1: Success retrieval
  {
    const request = new ApiRequest({
      method: 'GET',
      path: '/field/distributors/dist-exist',
      version: 'v2',
      requestId: 'req-1',
      pathParams: { id: 'dist-exist' }
    });

    const response = await handler.execute(request, context);
    assert(response.success === true, 'Response must be success');
    assert(response.status === 200, 'Status must be 200');
    assert(response.data.id === 'dist-exist', 'ID must match');
    assert(response.data.name === 'Distributor A', 'Name must match');
  }

  // Test Case 2: Not Found
  {
    const request = new ApiRequest({
      method: 'GET',
      path: '/field/distributors/dist-none',
      version: 'v2',
      requestId: 'req-2',
      pathParams: { id: 'dist-none' }
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
      path: '/field/distributors/',
      version: 'v2',
      requestId: 'req-3',
      pathParams: { id: '' }
    });

    const response = await handler.execute(request, context);
    assert(response.success === false, 'Response must fail');
    assert(response.status === 400, 'Status must be 400');
    assert(response.error?.code === 'INVALID_INPUT', 'Error code must match');
  }

  console.log('[Test DistributorHandler] All tests PASSED.');
}

runTests().catch(err => {
  console.error('[Test DistributorHandler] Failed:', err);
  process.exit(1);
});
