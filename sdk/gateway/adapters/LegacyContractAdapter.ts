import { TaskContract } from '../models/TaskContractModels';
import { ContractAdapter } from './ContractAdapter';
import { LegacyDistributionRequest } from '../dto/LegacyDistributionRequest';
import { LegacyAreaDetailsRequest } from '../dto/LegacyAreaDetailsRequest';
import { LegacyDashboardRequest } from '../dto/LegacyDashboardRequest';

/**
 * Base adapter class that encapsulates extraction of metadata from TaskContract.
 * This ensures that if the TaskContract structure changes in the future,
 * the adapters only need to update their extraction strategy here.
 */
abstract class BaseLegacyAdapter<TOutput> implements ContractAdapter<TOutput> {
  abstract supports(contract: TaskContract): boolean;
  abstract convert(contract: TaskContract): TOutput;

  protected getMetadata(contract: TaskContract): Record<string, any> {
    // Current public contract dictates metadata is located under ceoDecision.metadata
    return contract.ceoDecision.metadata || {};
  }
}

/**
 * Adapter for translating TaskContract into LegacyDistributionRequest.
 * Enforces Adapter Validation only (no Business Logic).
 */
export class LegacyDistributionAdapter extends BaseLegacyAdapter<LegacyDistributionRequest> {
  supports(contract: TaskContract): boolean {
    const meta = this.getMetadata(contract);
    return contract.intent === 'IMPLEMENTATION' && meta.legacyOperation === 'submitDistribution';
  }

  convert(contract: TaskContract): LegacyDistributionRequest {
    const meta = this.getMetadata(contract);

    // Adapter Validation
    if (typeof meta.legacySheetName !== 'string' || !meta.legacySheetName) {
      throw new Error('Adapter Validation Error: legacySheetName is missing or invalid');
    }
    if (typeof meta.rowId !== 'number' || meta.rowId <= 0) {
      throw new Error('Adapter Validation Error: rowId is missing or invalid (must be > 0)');
    }
    if (typeof meta.areaId !== 'string' || !meta.areaId) {
      throw new Error('Adapter Validation Error: areaId is missing or invalid');
    }
    if (typeof meta.staffName !== 'string' || !meta.staffName) {
      throw new Error('Adapter Validation Error: staffName is missing or invalid');
    }
    if (typeof meta.count !== 'number' || meta.count < 0) {
      throw new Error('Adapter Validation Error: count is missing or invalid (must be >= 0)');
    }
    if (typeof meta.isDone !== 'boolean') {
      throw new Error('Adapter Validation Error: isDone is missing or invalid');
    }
    if (typeof meta.points !== 'number') {
      throw new Error('Adapter Validation Error: points is missing or invalid');
    }

    return Object.freeze({
      legacySheetName: meta.legacySheetName,
      rowId: meta.rowId,
      areaId: meta.areaId,
      staffName: meta.staffName,
      count: meta.count,
      isDone: meta.isDone,
      points: meta.points
    });
  }
}

/**
 * Adapter for translating TaskContract into LegacyAreaDetailsRequest.
 * Enforces Adapter Validation only (no Business Logic).
 */
export class LegacyAreaDetailsAdapter extends BaseLegacyAdapter<LegacyAreaDetailsRequest> {
  supports(contract: TaskContract): boolean {
    const meta = this.getMetadata(contract);
    return contract.intent === 'RESEARCH' && meta.legacyOperation === 'getAreaDetails';
  }

  convert(contract: TaskContract): LegacyAreaDetailsRequest {
    const meta = this.getMetadata(contract);

    // Adapter Validation
    if (typeof meta.legacySheetName !== 'string' || !meta.legacySheetName) {
      throw new Error('Adapter Validation Error: legacySheetName is missing or invalid');
    }
    if (typeof meta.areaId !== 'string' || !meta.areaId) {
      throw new Error('Adapter Validation Error: areaId is missing or invalid');
    }

    return Object.freeze({
      legacySheetName: meta.legacySheetName,
      areaId: meta.areaId
    });
  }
}

/**
 * Adapter for translating TaskContract into LegacyDashboardRequest.
 * Enforces Adapter Validation only (no Business Logic).
 */
export class LegacyDashboardAdapter extends BaseLegacyAdapter<LegacyDashboardRequest> {
  supports(contract: TaskContract): boolean {
    const meta = this.getMetadata(contract);
    return contract.intent === 'RESEARCH' && meta.legacyOperation === 'getDashboardData';
  }

  convert(contract: TaskContract): LegacyDashboardRequest {
    const meta = this.getMetadata(contract);

    // Adapter Validation
    if (typeof meta.legacySheetName !== 'string' || !meta.legacySheetName) {
      throw new Error('Adapter Validation Error: legacySheetName is missing or invalid');
    }
    if (typeof meta.dashboardType !== 'string' || !meta.dashboardType) {
      throw new Error('Adapter Validation Error: dashboardType is missing or invalid');
    }

    return Object.freeze({
      legacySheetName: meta.legacySheetName,
      dashboardType: meta.dashboardType
    });
  }
}
