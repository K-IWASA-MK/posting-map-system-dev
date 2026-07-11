import { EndpointRegistry } from '@core/api/EndpointRegistry';
import { FieldStockHandler } from '@api/field/FieldStockHandler';
import { DistributorHandler } from '@api/field/DistributorHandler';
import { ReservationHandler } from '@api/field/ReservationHandler';
import { StaffApplicationService } from '@application/field/services/StaffApplicationService';
import { HoldingApplicationService } from '@application/field/services/HoldingApplicationService';
import { ActivityApplicationService } from '@application/field/services/ActivityApplicationService';
import { SpreadsheetStaffRepository } from '@infra/repository/field/SpreadsheetStaffRepository';
import { SpreadsheetFlyerHoldingRepository } from '@infra/repository/field/SpreadsheetFlyerHoldingRepository';
import { SpreadsheetActivityRepository } from '@infra/repository/field/SpreadsheetActivityRepository';
import { ApplicationEventPublisher } from '@application/events/ApplicationEventPublisher';
import { FIELD_ENDPOINTS } from '@api/registry/FieldEndpoints';

let initialized = false;

export function bootstrapFieldApis(): void {
  if (initialized) return;

  const registry = EndpointRegistry.getInstance();

  const staffRepo = new SpreadsheetStaffRepository();
  const holdingRepo = new SpreadsheetFlyerHoldingRepository();
  const activityRepo = new SpreadsheetActivityRepository();
  const eventPublisher = new ApplicationEventPublisher();

  const staffAppService = new StaffApplicationService(staffRepo);
  const holdingAppService = new HoldingApplicationService(holdingRepo, eventPublisher);
  const activityAppService = new ActivityApplicationService(activityRepo, eventPublisher);

  const handlers: Record<string, any> = {
    FieldStockHandler: new FieldStockHandler(holdingAppService),
    DistributorHandler: new DistributorHandler(staffAppService),
    ReservationHandler: new ReservationHandler(activityAppService, holdingAppService)
  };

  for (const config of FIELD_ENDPOINTS) {
    const handlerInstance = handlers[config.handler];
    if (!handlerInstance) {
      throw new Error(`Bootstrap resolution failed: Handler class '${config.handler}' not mapped in FieldApiBootstrap`);
    }
    registry.register(config.method, config.version, config.path, handlerInstance);
  }

  initialized = true;
}
