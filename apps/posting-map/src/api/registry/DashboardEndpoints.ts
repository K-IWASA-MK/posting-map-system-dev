import { EndpointConfig } from './FieldEndpoints';

export const DASHBOARD_ENDPOINTS: EndpointConfig[] = [
  {
    path: '/dashboard/me',
    method: 'GET',
    version: 'v2',
    handler: 'DashboardHandler'
  },
  {
    path: '/dashboard/workspace/{id}',
    method: 'GET',
    version: 'v2',
    handler: 'DashboardHandler'
  },
  {
    path: '/dashboard/ranking',
    method: 'GET',
    version: 'v2',
    handler: 'DashboardHandler'
  }
];
