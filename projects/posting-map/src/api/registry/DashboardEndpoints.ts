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
  },
  {
    path: '/dashboard/facts',
    method: 'GET',
    version: 'v2',
    handler: 'DashboardFactHandler'
  },
  {
    path: '/dashboard/facts/detail/{id}',
    method: 'GET',
    version: 'v2',
    handler: 'DashboardFactHandler'
  },
  {
    path: '/dashboard/holdings',
    method: 'GET',
    version: 'v2',
    handler: 'DashboardFactHandler'
  },
  {
    path: '/dashboard/holdings/add',
    method: 'POST',
    version: 'v2',
    handler: 'DashboardFactHandler'
  },
  {
    path: '/dashboard/holdings/update',
    method: 'POST',
    version: 'v2',
    handler: 'DashboardFactHandler'
  },
  {
    path: '/dashboard/holdings/delete',
    method: 'POST',
    version: 'v2',
    handler: 'DashboardFactHandler'
  }
];
