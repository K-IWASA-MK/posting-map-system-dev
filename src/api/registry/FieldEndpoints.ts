export interface EndpointConfig {
  path: string;
  method: string;
  version: string;
  handler: string;
}

export const FIELD_ENDPOINTS: EndpointConfig[] = [
  {
    path: '/field/stocks/{id}',
    method: 'GET',
    version: 'v2',
    handler: 'FieldStockHandler'
  },
  {
    path: '/field/reservation',
    method: 'POST',
    version: 'v2',
    handler: 'ReservationHandler'
  },
  {
    path: '/field/distributors/{id}',
    method: 'GET',
    version: 'v2',
    handler: 'DistributorHandler'
  }
];
