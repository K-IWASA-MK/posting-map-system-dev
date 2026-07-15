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
  },
  {
    path: '/operations/dashboard/workspaces',
    method: 'GET',
    version: 'v2',
    handler: 'OperationsDashboardHandler'
  },
  {
    path: '/operations/workspaces',
    method: 'POST',
    version: 'v2',
    handler: 'WorkspaceHandler'
  },
  {
    path: '/operations/workspaces',
    method: 'GET',
    version: 'v2',
    handler: 'WorkspaceHandler'
  }
];
