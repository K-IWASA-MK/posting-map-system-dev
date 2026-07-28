/**
 * EmployeeDomain.ts
 * 
 * Employee Domain Model
 */

import { DomainId } from './DomainId';

export interface EmployeeDomain {
  domainId: DomainId;
  domainName: string;
  category: string;
  description: string;
}
