import { OrderRequest } from './OrderRequest';
import { MissionCreator, Mission } from './MissionCreator';
import { ResearchTrigger } from './ResearchTrigger';

export class OrderRuntime {
  public static async processOrder(order: any): Promise<{ success: boolean; message: string; missionId?: string }> {
    // 1. Validation
    if (!order) {
      return { success: false, message: "Order cannot be empty" };
    }
    if (!order.orderId) {
      return { success: false, message: "Missing orderId" };
    }
    if (!order.districtName) {
      return { success: false, message: "Missing districtName" };
    }
    if (!order.customerType || order.customerType !== 'branch') {
      return { success: false, message: "Invalid or missing customerType" };
    }
    if (!order.requestedAt) {
      return { success: false, message: "Missing requestedAt" };
    }

    const request: OrderRequest = {
      orderId: order.orderId,
      districtName: order.districtName,
      customerType: order.customerType,
      requestedAt: order.requestedAt
    };

    // 2. Create Mission
    const mission = MissionCreator.createMission(request);
    console.log(`[OrderRuntime] Mission Created: ${mission.missionId}`);

    // 3. Trigger Research Agent
    const triggerResult = await ResearchTrigger.trigger(mission);

    return {
      success: true,
      message: `Mission Created. ${triggerResult.message}`,
      missionId: mission.missionId
    };
  }
}
