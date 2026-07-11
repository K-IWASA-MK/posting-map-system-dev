import { EndpointRegistry } from '@core/api/EndpointRegistry';
import { FieldStockHandler } from '@api/field/FieldStockHandler';
import { DistributorHandler } from '@api/field/DistributorHandler';
import { ReservationHandler } from '@api/field/ReservationHandler';
import { FlyerStockApplicationService } from '@application/field/services/FlyerStockApplicationService';
import { DistributionApplicationService } from '@application/field/services/DistributionApplicationService';
import { SpreadsheetFlyerRepository } from '@infra/repository/field/SpreadsheetFlyerRepository';
import { SpreadsheetDistributorRepository } from '@infra/repository/field/SpreadsheetDistributorRepository';
import { DistributionDomainService } from '@domain/field/services/DistributionDomainService';
import { ApplicationEventPublisher } from '@application/events/ApplicationEventPublisher';
import { FIELD_ENDPOINTS } from '@api/registry/FieldEndpoints';

let initialized = false;

export function bootstrapFieldApis(): void {
  if (initialized) return;

  const registry = EndpointRegistry.getInstance();

  // Instantiate Concrete Infrastructure and Domain / Application services
  const flyerRepo = new SpreadsheetFlyerRepository();
  const distRepo = new SpreadsheetDistributorRepository();
  const domainService = new DistributionDomainService();
  const eventPublisher = new ApplicationEventPublisher();

  const flyerStockAppService = new FlyerStockApplicationService(flyerRepo, domainService, eventPublisher);
  const distributionAppService = new DistributionApplicationService(distRepo);

  // Map of handlers for composition resolution
  const handlers: Record<string, any> = {
    FieldStockHandler: new FieldStockHandler(flyerStockAppService),
    DistributorHandler: new DistributorHandler(distributionAppService),
    ReservationHandler: new ReservationHandler(flyerStockAppService)
  };

  // Dynamic endpoint registration
  for (const config of FIELD_ENDPOINTS) {
    const handlerInstance = handlers[config.handler];
    if (!handlerInstance) {
      throw new Error(`Bootstrap resolution failed: Handler class '${config.handler}' not mapped in FieldApiBootstrap`);
    }
    registry.register(config.method, config.version, config.path, handlerInstance);
  }

  initialized = true;
}
