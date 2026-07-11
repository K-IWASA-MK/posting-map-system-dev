import { EndpointRegistry } from '@core/api/EndpointRegistry';
import { FieldStockHandler } from '@api/field/FieldStockHandler';
import { DistributorHandler } from '@api/field/DistributorHandler';
import { ReservationHandler } from '@api/field/ReservationHandler';
import { DashboardHandler } from '@api/dashboard/DashboardHandler';
import { SubscriptionHandler } from '@api/subscription/SubscriptionHandler';
import { OperationsDashboardHandler } from '@api/operations/OperationsDashboardHandler';
import { StaffApplicationService } from '@application/field/services/StaffApplicationService';
import { HoldingApplicationService } from '@application/field/services/HoldingApplicationService';
import { ActivityApplicationService } from '@application/field/services/ActivityApplicationService';
import { DashboardApplicationService } from '@application/dashboard/services/DashboardApplicationService';
import { SubscriptionApplicationService } from '@application/subscription/SubscriptionApplicationService';
import { OperationsDashboardApplicationService } from '@application/operations/services/OperationsDashboardApplicationService';
import { SpreadsheetStaffRepository } from '@infra/repository/field/SpreadsheetStaffRepository';
import { SpreadsheetFlyerHoldingRepository } from '@infra/repository/field/SpreadsheetFlyerHoldingRepository';
import { SpreadsheetActivityRepository } from '@infra/repository/field/SpreadsheetActivityRepository';
import { SpreadsheetWorkspaceRepository } from '@infra/repository/workspace/SpreadsheetWorkspaceRepository';
import { SpreadsheetWorkspaceSubscriptionRepository } from '@infra/repository/workspace/SpreadsheetWorkspaceSubscriptionRepository';
import { WorkspaceSubscriptionGate } from '@application/subscription/WorkspaceSubscriptionGate';
import { ApplicationEventPublisher } from '@application/events/ApplicationEventPublisher';
import { FIELD_ENDPOINTS } from '@api/registry/FieldEndpoints';
import { DASHBOARD_ENDPOINTS } from '@api/registry/DashboardEndpoints';
import { OPERATIONS_ENDPOINTS } from '@api/registry/OperationsEndpoints';

let initialized = false;

export function bootstrapFieldApis(): void {
  if (initialized) return;

  const registry = EndpointRegistry.getInstance();

  const workspaceRepo = new SpreadsheetWorkspaceRepository();
  const subscriptionRepo = new SpreadsheetWorkspaceSubscriptionRepository();
  const staffRepo = new SpreadsheetStaffRepository();
  const holdingRepo = new SpreadsheetFlyerHoldingRepository();
  const activityRepo = new SpreadsheetActivityRepository();
  const eventPublisher = new ApplicationEventPublisher();

  // Register the Workspace Subscription Gate singleton
  new WorkspaceSubscriptionGate(subscriptionRepo, staffRepo);

  const staffAppService = new StaffApplicationService(staffRepo);
  const holdingAppService = new HoldingApplicationService(holdingRepo, eventPublisher);
  const activityAppService = new ActivityApplicationService(activityRepo, eventPublisher);
  const dashboardAppService = new DashboardApplicationService(workspaceRepo, staffRepo, holdingRepo, activityRepo);
  const subscriptionAppService = new SubscriptionApplicationService(subscriptionRepo);
  const operationsDashboardAppService = new OperationsDashboardApplicationService(workspaceRepo, subscriptionRepo);

  const handlers: Record<string, any> = {
    FieldStockHandler: new FieldStockHandler(holdingAppService),
    DistributorHandler: new DistributorHandler(staffAppService),
    ReservationHandler: new ReservationHandler(activityAppService, holdingAppService),
    DashboardHandler: new DashboardHandler(dashboardAppService),
    SubscriptionHandler: new SubscriptionHandler(subscriptionAppService),
    OperationsDashboardHandler: new OperationsDashboardHandler(operationsDashboardAppService)
  };

  // Register Field API Endpoints
  for (const config of FIELD_ENDPOINTS) {
    const handlerInstance = handlers[config.handler];
    if (!handlerInstance) {
      throw new Error(`Bootstrap resolution failed: Handler class '${config.handler}' not mapped in FieldApiBootstrap`);
    }
    registry.register(config.method, config.version, config.path, handlerInstance);
  }

  // Register Dashboard API Endpoints
  for (const config of DASHBOARD_ENDPOINTS) {
    const handlerInstance = handlers[config.handler];
    if (!handlerInstance) {
      throw new Error(`Bootstrap resolution failed: Handler class '${config.handler}' not mapped in FieldApiBootstrap`);
    }
    registry.register(config.method, config.version, config.path, handlerInstance);
  }

  // Register Operations API Endpoints
  for (const config of OPERATIONS_ENDPOINTS) {
    const handlerInstance = handlers[config.handler];
    if (!handlerInstance) {
      throw new Error(`Bootstrap resolution failed: Handler class '${config.handler}' not mapped in FieldApiBootstrap`);
    }
    registry.register(config.method, config.version, config.path, handlerInstance);
  }

  initialized = true;
}
