import { EndpointConfig } from './FieldEndpoints';

export const OPERATIONS_ENDPOINTS: EndpointConfig[] = [
  {
    path: '/operations/subscriptions',
    method: 'GET',
    version: 'v2',
    handler: 'SubscriptionHandler'
  },
  {
    path: '/operations/subscriptions/update',
    method: 'POST',
    version: 'v2',
    handler: 'SubscriptionHandler'
  }
];
