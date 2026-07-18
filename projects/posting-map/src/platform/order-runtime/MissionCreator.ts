import { OrderRequest } from './OrderRequest';

export interface Mission {
  missionId: string;
  orderId: string;
  districtName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export class MissionCreator {
  public static createMission(order: OrderRequest): Mission {
    return {
      missionId: `MIS-${order.orderId}-${Date.now()}`,
      orderId: order.orderId,
      districtName: order.districtName,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
  }
}
